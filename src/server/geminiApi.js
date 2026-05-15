const readJsonBody = (request) =>
  new Promise((resolveBody, rejectBody) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        rejectBody(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch (error) {
        rejectBody(new Error("Invalid JSON body."));
      }
    });
  });

const rateLimitStore = new Map();

const getRateLimitConfig = (config) => ({
  maxRequests: Number(config.GEMINI_RATE_LIMIT_MAX || 10),
  windowMs: Number(config.GEMINI_RATE_LIMIT_WINDOW_MS || 60_000),
});

const getClientId = (request) => {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.socket?.remoteAddress || "unknown";
};

const checkRateLimit = (request, config) => {
  const { maxRequests, windowMs } = getRateLimitConfig(config);
  const clientId = getClientId(request);
  const now = Date.now();
  const current = rateLimitStore.get(clientId);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true };
};

const sendJson = (response, statusCode, payload, headers = {}) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    ...headers,
  });
  response.end(JSON.stringify(payload));
};

const askGemini = async (prompt, apiKey) => {
  if (!apiKey?.trim()) {
    return {
      statusCode: 500,
      payload: { error: "Gemini API key is not configured." },
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json();

  if (!response.ok) {
    return {
      statusCode: response.status,
      payload: { error: data?.error?.message || "Unable to call Gemini." },
    };
  }

  return {
    statusCode: 200,
    payload: { text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "" },
  };
};

export const handleGeminiRequest = async (request, response, config) => {
  const apiKey = config.GEMINI_API_KEY;
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const rateLimit = checkRateLimit(request, config);
  if (!rateLimit.allowed) {
    sendJson(
      response,
      429,
      { error: "Too many requests. Please try again later." },
      { "Retry-After": String(rateLimit.retryAfterSeconds) },
    );
    return;
  }

  try {
    const { prompt } = await readJsonBody(request);
    if (!prompt || typeof prompt !== "string") {
      sendJson(response, 400, { error: "Prompt is required." });
      return;
    }

    const result = await askGemini(prompt, apiKey);
    sendJson(response, result.statusCode, result.payload);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error." });
  }
};
