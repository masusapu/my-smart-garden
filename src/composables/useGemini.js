import { computed, ref } from "vue";

export function useGemini(apiKey) {
  const activeRequests = ref(0);
  const isLoading = computed(() => activeRequests.value > 0);

  const askGemini = async (prompt, { trackLoading = true } = {}) => {
    if (!apiKey?.trim()) {
      return { ok: false, error: "Gemini API key is not configured." };
    }

    if (trackLoading) {
      activeRequests.value += 1;
    }

    try {
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
        const message = data?.error?.message || "Unable to call Gemini.";
        return { ok: false, error: `Gemini error: ${message}` };
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return { ok: false, error: "Gemini did not return usable content." };
      }

      return { ok: true, text };
    } catch (e) {
      return { ok: false, error: "AI connection error." };
    } finally {
      if (trackLoading) {
        activeRequests.value -= 1;
      }
    }
  };

  return { isLoading, askGemini };
}
