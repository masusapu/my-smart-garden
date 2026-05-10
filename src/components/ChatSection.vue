<template>
  <div class="chat-section" v-if="selectedPlant">
    <h3>Đang chat về: {{ selectedPlant.name }}</h3>
    <div class="chat-box" ref="chatContainer">
      <MessageBubble
        v-for="(msg, i) in selectedPlant.history"
        :key="i"
        :text="msg.text"
        :role="msg.role"
      />
    </div>
    <ChatInput
      :is-loading="isLoading"
      @send-message="$emit('send-message', $event)"
    />
  </div>
  <div class="chat-section empty" v-else>
    <p>Chọn một cây để bắt đầu tư vấn riêng biệt</p>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import MessageBubble from "./MessageBubble.vue";
import ChatInput from "./ChatInput.vue";

const props = defineProps({
  selectedPlant: Object,
  isLoading: Boolean,
});

const emit = defineEmits(["send-message"]);

const chatContainer = ref(null);

// Expose scroll function if needed, but for now, handle in parent
defineExpose({
  scrollToBottom: async () => {
    await nextTick();
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  },
});
</script>

<style scoped>
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
}
.chat-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background-color: #f0f2f5;
}
</style>
