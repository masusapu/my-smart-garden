import { ref } from "vue";

export function useGemini(apiKey) {
  const isLoading = ref(false);

  const askGemini = async (prompt) => {
    if (!apiKey?.trim()) {
      return "Gemini API key is not configured.";
    }

    isLoading.value = true;
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
        return `Gemini error: ${message}`;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || "Gemini did not return usable content.";
    } catch (e) {
      return "AI connection error.";
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, askGemini };
}
