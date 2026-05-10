<script setup>
import { ref, nextTick } from "vue";
import { useLocalStorage } from "./composables/useLocalStorage";
import { useGemini } from "./composables/useGemini";
import PlantSidebar from "./components/PlantSidebar.vue";
import ChatSection from "./components/ChatSection.vue";

const API_KEY = "my-";
const { isLoading, askGemini } = useGemini(API_KEY);

// Quản lý danh sách cây
const myGarden = useLocalStorage("smart-garden-v2", []);
const selectedPlant = ref(null);
const chatSectionRef = ref(null);
const addingLoading = ref(false);

// Thêm cây mới
const addPlant = async ({ name, status }) => {
  console.log("Adding plant:", name, status);
  addingLoading.value = true;
  let finalStatus = status;
  try {
    const summaryPrompt = `Tóm tắt tình trạng cây "${name}" với vấn đề "${status}" một cách súc tích, dưới 10 từ. Chỉ trả lời tóm tắt, không thêm gì khác.`;
    console.log("Prompt:", summaryPrompt);
    const summarizedStatus = await askGemini(summaryPrompt);
    console.log("Summarized status:", summarizedStatus);
    if (summarizedStatus && !summarizedStatus.includes("Lỗi")) {
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
  const prompt = `Bạn là trợ lý AI chuyên về cây trồng. Trả lời câu hỏi về cây ${plant.name} (tình trạng: ${plant.status}) một cách hữu ích và trực tiếp, không cần chào hỏi lặp lại. 
                  Lịch sử trò chuyện: ${JSON.stringify(plant.history)}. 
                  Câu hỏi mới: ${userText}`;

  // 3. Hỏi Gemini
  const response = await askGemini(prompt);

  // 4. Lưu câu trả lời của Gemini vào đúng cây đó
  plant.history.push({ role: "model", text: response });

  // 5. Tóm tắt lại tình trạng dựa trên lịch sử mới
  try {
    const statusPrompt = `Dựa trên lịch sử trò chuyện sau, tóm tắt tình trạng hiện tại của cây ${plant.name} một cách súc tích, dưới 10 từ. Chỉ trả lời tóm tắt. Lịch sử: ${JSON.stringify(plant.history)}`;
    const newStatus = await askGemini(statusPrompt);
    if (newStatus && !newStatus.includes("Lỗi")) {
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
      @select-plant="selectedPlant = $event"
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
  height: 90vh;
  gap: 20px;
  font-family: sans-serif;
}
</style>
