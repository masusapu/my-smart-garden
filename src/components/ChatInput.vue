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
  if (!message.value || props.isLoading) return;
  emit("send-message", message.value);
  message.value = "";
};
</script>

<style scoped>
.input-area {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.input-area input {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
</style>
