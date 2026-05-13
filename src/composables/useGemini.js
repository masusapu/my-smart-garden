import { computed, ref } from "vue";

export function useGemini() {
  const activeRequests = ref(0);
  const isLoading = computed(() => activeRequests.value > 0);

  const askGemini = async (prompt, { trackLoading = true } = {}) => {
    if (trackLoading) {
      activeRequests.value += 1;
    }

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (!response.ok) {
        return { ok: false, error: data?.error || "Unable to call Gemini." };
      }

      const text = data?.text;
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
