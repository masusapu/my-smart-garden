<template>
  <div class="chat-section" v-if="selectedPlant">
    <h3 class="chat-title">
      <span class="chat-title-icon" aria-hidden="true">
        {{ selectedPlant.icon || "🌱" }}
      </span>
      <span>{{ selectedPlant.name }}</span>
    </h3>
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
    if (!chatContainer.value) return;

    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  },
});
</script>

<style scoped>
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.96);
  padding: 24px;
  border-radius: 30px;
  border: 1px solid rgba(127, 203, 188, 0.2);
  box-shadow: 0 18px 50px rgba(80, 142, 127, 0.06);
}
.chat-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 1.3rem;
}
.chat-title-icon {
  display: grid;
  place-items: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: #f0fbf4;
  font-size: 1.45rem;
  line-height: 1;
}
.chat-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background: #f7fffb;
  border-radius: 24px;
  border: 1px solid rgba(187, 222, 214, 0.55);
}
.chat-section.empty {
  align-items: center;
  justify-content: center;
  color: #6a7c76;
}
.chat-section.empty p {
  font-size: 1rem;
}
</style>
