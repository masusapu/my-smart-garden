<script setup>
import { ref, nextTick } from "vue";
import { useLocalStorage } from "./composables/useLocalStorage";
import { useGemini } from "./composables/useGemini";
import PlantSidebar from "./components/PlantSidebar.vue";
import ChatSection from "./components/ChatSection.vue";
import { PROMPTS } from "./config/prompts";

const { isLoading, askGemini } = useGemini();

// Quản lý danh sách cây
const myGarden = useLocalStorage("smart-garden-plants-v3", []);

// Hàm xử lý kết quả trả về từ Gemini (tách text và cập nhật vườn)
const processAiResponse = async (response) => {
  if (!response.ok) {
    chatHistory.value.push({
      role: "model",
      text: "Lỗi kết nối: " + response.error,
    });
    return;
  }

  let aiText = response.text;
  const gardenStateMatch = aiText.match(
    /<GARDEN_STATE>([\s\S]*?)<\/GARDEN_STATE>/,
  );

  if (gardenStateMatch) {
    try {
      myGarden.value = JSON.parse(gardenStateMatch[1]);
      // Xóa phần JSON ẩn khỏi text hiển thị cho người dùng
      aiText = aiText
        .replace(/<GARDEN_STATE>[\s\S]*?<\/GARDEN_STATE>/, "")
        .trim();
    } catch (e) {
      console.error("Lỗi parse dữ liệu vườn từ AI:", e);
    }
  }

  chatHistory.value.push({ role: "model", text: aiText });
  await nextTick();
  chatSectionRef.value?.scrollToBottom();
};

// Cây đang được chọn để tập trung trò chuyện
const selectedPlant = ref(null);
const selectPlant = async (plant) => {
  // Nếu nhấn lại chính cây đang chọn thì không làm gì cả
  if (selectedPlant.value?.id === plant.id) return;
  selectedPlant.value = plant;

  const prompt = PROMPTS.getPlantSelectionPrompt(plant, myGarden.value);
  const response = await askGemini(prompt);
  await processAiResponse(response);
};

// Quản lý lịch sử chat chung
const chatHistory = useLocalStorage("smart-garden-chat-v3", [
  {
    role: "model",
    text: PROMPTS.INITIAL_MESSAGE,
  },
]);

const chatSectionRef = ref(null);

const sendMessage = async (userText) => {
  if (!userText || isLoading.value) return;

  // 1. Lưu tin nhắn của người dùng vào lịch sử chung
  chatHistory.value.push({ role: "user", text: userText });

  // 2. Tạo prompt yêu cầu Gemini trả về phản hồi + danh sách cây cập nhật
  const prompt = PROMPTS.getChatPrompt(
    userText,
    myGarden.value,
    chatHistory.value,
    selectedPlant.value?.name,
  );

  const response = await askGemini(prompt);
  await processAiResponse(response);
};
</script>

<template>
  <div class="container">
    <PlantSidebar
      :plants="myGarden"
      :selected-plant="selectedPlant"
      @select-plant="selectPlant"
    />
    <ChatSection
      ref="chatSectionRef"
      :history="chatHistory"
      :is-loading="isLoading"
      @send-message="sendMessage"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: calc(100vh - 40px);
  gap: 20px;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f5faf5;
  border-radius: 30px;
  box-shadow: 0 24px 70px rgba(100, 100, 120, 0.08);
}
</style>
