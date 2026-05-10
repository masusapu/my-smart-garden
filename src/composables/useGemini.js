import { ref } from "vue";

export function useGemini(apiKey) {
  const isLoading = ref(false);

  const askGemini = async (prompt) => {
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
      const text = data.candidates[0].content.parts[0].text;
      return text; // Trả về text để bên App.vue tự xử lý lưu vào lịch sử
    } catch (e) {
      return "Lỗi kết nối AI rồi...";
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, askGemini };
}
