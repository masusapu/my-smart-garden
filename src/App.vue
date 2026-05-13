<script setup>
import { ref, nextTick } from "vue";
import { useLocalStorage } from "./composables/useLocalStorage";
import { useGemini } from "./composables/useGemini";
import PlantSidebar from "./components/PlantSidebar.vue";
import ChatSection from "./components/ChatSection.vue";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const { isLoading, askGemini } = useGemini(API_KEY);

// Quản lý danh sách cây
const myGarden = useLocalStorage("smart-garden-v2", []);
const selectedPlant = ref(null);
const chatSectionRef = ref(null);
const addingLoading = ref(false);

const selectPlant = (plant) => {
  selectedPlant.value = plant;
};

// Thêm cây mới
const addPlant = async ({ name, status, icon }) => {
  console.log("Adding plant:", name, status, icon);
  addingLoading.value = true;
  let finalStatus = status;
  try {
    const summaryPrompt = `Tóm tắt tình trạng cây "${name}" với vấn đề "${status}" một cách súc tích, dưới 10 từ. Chỉ trả lời tóm tắt, không thêm gì khác.`;
    console.log("Prompt:", summaryPrompt);
    const summarizedStatus = await askGemini(summaryPrompt);
    console.log("Summarized status:", summarizedStatus);
    if (summarizedStatus && !summarizedStatus.includes("error")) {
      finalStatus = summarizedStatus.trim();
    }
  } catch (error) {
    console.error("Error summarizing:", error);
  } finally {
    addingLoading.value = false;
  }
  const plant = {
    id: Date.now(),
    name,
    status: finalStatus,
    icon: icon || "🌱",
    history: [],
  };
  myGarden.value.push(plant);
  console.log("Plant added with status:", finalStatus);
};

// Gửi tin nhắn trong khung chat của từng cây
const sendMessage = async (userText) => {
  if (!userText || isLoading.value) return;

  const plant = selectedPlant.value;

  // 1. Lưu tin nhắn của người dùng vào lịch sử cây đó
  plant.history.push({ role: "user", text: userText });

  // 2. Tạo prompt dựa trên ngữ cảnh của cây
  const prompt = `Bạn là một chuyên gia về cây trồng thân thiện, thoải mái. Hãy trả lời với tone tự nhiên, chia sẻ chi tiết cụ thể, như một người bạn đang giúp đỡ. Không cần quá trang trọng, hãy nói những gì bạn thực sự nghĩ. Chỉ tránh lặp lại lời chào nhiều lần nếu đã nói trong cuộc trò chuyện trước.

Cây đang chăm sóc: ${plant.name} (tình trạng: ${plant.status})
Lịch sử trò chuyện: ${JSON.stringify(plant.history)}

Câu hỏi: ${userText}

Hãy trả lời chi tiết, với những lời khuyên cụ thể và thực tế.`;

  // 3. Hỏi Gemini
  const response = await askGemini(prompt);

  // 4. Lưu câu trả lời của Gemini vào đúng cây đó
  plant.history.push({ role: "model", text: response });

  // 5. Tóm tắt lại tình trạng dựa trên lịch sử mới
  try {
    const statusPrompt = `Dựa trên lịch sử trò chuyện sau, tóm tắt tình trạng hiện tại của cây ${plant.name} một cách súc tích, dưới 10 từ. Chỉ trả lời tóm tắt. Lịch sử: ${JSON.stringify(plant.history)}`;
    const newStatus = await askGemini(statusPrompt);
    if (newStatus && !newStatus.includes("error")) {
      plant.status = newStatus.trim();
    }
  } catch (error) {
    console.error("Error updating status:", error);
  }

  // Cuộn xuống cuối khung chat
  await nextTick();
  chatSectionRef.value?.scrollToBottom();
};
</script>

<template>
  <div class="container">
    <PlantSidebar
      :plants="myGarden"
      :selected-plant="selectedPlant"
      :adding-loading="addingLoading"
      @add-plant="addPlant"
      @select-plant="selectPlant"
    />
    <ChatSection
      ref="chatSectionRef"
      :selected-plant="selectedPlant"
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
