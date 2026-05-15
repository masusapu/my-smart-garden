<script setup>
import { ref, nextTick } from "vue";
import { useLocalStorage } from "./composables/useLocalStorage";
import { useGemini } from "./composables/useGemini";
import PlantSidebar from "./components/PlantSidebar.vue";
import ChatSection from "./components/ChatSection.vue";

const { isLoading, askGemini } = useGemini();

// Quản lý danh sách cây
const myGarden = useLocalStorage("smart-garden-plants-v3", []);

// Cây đang được chọn để tập trung trò chuyện
const selectedPlant = ref(null);
const selectPlant = async (plant) => {
  // Nếu nhấn lại chính cây đang chọn thì không làm gì cả
  if (selectedPlant.value?.id === plant.id) return;

  selectedPlant.value = plant;

  // Tự động yêu cầu Gemini hỏi thăm về cây vừa chọn
  const prompt = `Người dùng vừa chọn xem cây: ${plant.name} (tình trạng: ${plant.status}).
  Hãy đóng vai chuyên gia làm vườn, hỏi thăm tình trạng của riêng cây này một cách cực kỳ ngắn gọn, tự nhiên.
  TUYỆT ĐỐI KHÔNG được bắt đầu bằng các câu chào hỏi xã giao như "Chào bạn", "Chào anh/chị".
  Ví dụ: "Cây ${plant.name} dạo này thế nào rồi?" hoặc "${plant.name} của bạn vẫn ổn chứ?".
  
  Lưu ý: Luôn đính kèm danh sách cây trong thẻ <GARDEN_STATE>...</GARDEN_STATE> ở cuối câu trả lời.
  Danh sách hiện tại: ${JSON.stringify(myGarden.value)}`;

  const response = await askGemini(prompt);
  if (!response.ok) return;

  let aiText = response.text;
  const gardenStateMatch = aiText.match(
    /<GARDEN_STATE>([\s\S]*?)<\/GARDEN_STATE>/,
  );

  if (gardenStateMatch) {
    try {
      myGarden.value = JSON.parse(gardenStateMatch[1]);
      aiText = aiText
        .replace(/<GARDEN_STATE>[\s\S]*?<\/GARDEN_STATE>/, "")
        .trim();
    } catch (e) {
      console.error(e);
    }
  }

  chatHistory.value.push({ role: "model", text: aiText });
  await nextTick();
  chatSectionRef.value?.scrollToBottom();
};

// Quản lý lịch sử chat chung
const chatHistory = useLocalStorage("smart-garden-chat-v3", [
  {
    role: "model",
    text: "Chào bạn! Vườn của bạn hôm nay thế nào? Hãy kể cho tôi nghe về những mầm xanh mới hoặc tình hình các cây nhé!",
  },
]);

const chatSectionRef = ref(null);

const sendMessage = async (userText) => {
  if (!userText || isLoading.value) return;

  // 1. Lưu tin nhắn của người dùng vào lịch sử chung
  chatHistory.value.push({ role: "user", text: userText });

  // 2. Tạo prompt yêu cầu Gemini trả về phản hồi + danh sách cây cập nhật
  const currentPlantsStr = JSON.stringify(myGarden.value);
  const prompt = `Bạn là một chuyên gia làm vườn thông minh.
Nhiệm vụ của bạn:
1. Trả lời người dùng một cách thân thiện, chi tiết về cách chăm sóc cây. TUYỆT ĐỐI KHÔNG chào hỏi ở đầu câu trả lời. Hãy đi thẳng vào nội dung tư vấn.
2. Theo dõi danh sách cây trồng trong vườn dựa trên cuộc hội thoại.
3. Nếu người dùng nhắc đến cây mới, hãy thêm vào danh sách. Nếu nhắc đến tình trạng mới của cây cũ, hãy cập nhật.
4. CUỐI CÙNG của câu trả lời, hãy luôn đính kèm danh sách TOÀN BỘ các cây hiện có trong vườn dưới định dạng JSON nằm trong thẻ <GARDEN_STATE>...</GARDEN_STATE>.
   Mỗi cây gồm: { "id": số, "name": "tên", "status": "tóm tắt tình trạng ngắn gọn", "icon": "emoji đại diện" }
   Nếu người dùng muốn xóa một cây, hãy loại bỏ nó khỏi danh sách JSON này.
   Nếu không có thay đổi, vẫn phải gửi lại danh sách cũ trong thẻ đó.
5. ĐẶC BIỆT: Nếu người dùng đang chọn một cây cụ thể (thông tin bên dưới), hãy ưu tiên trả lời về cây đó trừ khi họ hỏi sang vấn đề khác.

Danh sách cây hiện tại: ${currentPlantsStr}
Lịch sử trò chuyện: ${JSON.stringify(chatHistory.value)}

Thông tin bổ sung: Người dùng đang chọn xem cây: ${selectedPlant.value ? selectedPlant.value.name : "Không có cây nào cụ thể"}.
Câu hỏi của người dùng: "${userText}"`;

  const response = await askGemini(prompt);
  if (!response.ok) {
    chatHistory.value.push({
      role: "model",
      text: "Lỗi kết nối: " + response.error,
    });
    return;
  }

  let aiText = response.text;

  // 3. Tách phần text chat và phần dữ liệu vườn
  const gardenStateMatch = aiText.match(
    /<GARDEN_STATE>([\s\S]*?)<\/GARDEN_STATE>/,
  );

  if (gardenStateMatch) {
    try {
      const newGardenState = JSON.parse(gardenStateMatch[1]);
      myGarden.value = newGardenState;
      // Xóa phần JSON khỏi text hiển thị cho người dùng sạch sẽ
      aiText = aiText
        .replace(/<GARDEN_STATE>[\s\S]*?<\/GARDEN_STATE>/, "")
        .trim();
    } catch (e) {
      console.error("Lỗi parse dữ liệu vườn:", e);
    }
  }

  chatHistory.value.push({ role: "model", text: aiText });

  await nextTick();
  chatSectionRef.value?.scrollToBottom();
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
