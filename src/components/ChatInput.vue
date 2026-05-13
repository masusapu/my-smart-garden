<template>
  <div class="input-area">
    <input
      v-model="message"
      @keyup.enter="handleSend"
      placeholder="Hỏi về cây này..."
    />
    <button @click="handleSend" :disabled="isLoading">Gửi</button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const message = ref("");

const props = defineProps({
  isLoading: Boolean,
});

const emit = defineEmits(["send-message"]);

const handleSend = () => {
  const trimmedMessage = message.value.trim();

  if (!trimmedMessage || props.isLoading) return;

  emit("send-message", trimmedMessage);
  message.value = "";
};
</script>

<style scoped>
.input-area {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}
.input-area input {
  flex: 1;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(117, 204, 176, 0.45);
  background: #fcfffc;
  outline: none;
  font-size: 0.98rem;
}
.input-area button {
  border: none;
  border-radius: 18px;
  background: #3d9d8c;
  color: white;
  padding: 0 20px;
  font-weight: 700;
  cursor: pointer;
}
.input-area button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
