<template>
  <div :class="['msg', role]">
    <div class="bubble" v-html="renderedText"></div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { marked } from "marked";

const props = defineProps({
  text: String,
  role: String,
});

const renderedText = computed(() => marked.parse(props.text, { breaks: true }));
</script>

<style scoped>
.msg {
  display: flex;
  width: 100%;
  margin-bottom: 12px;
  text-align: left;
}
.msg.model {
  justify-content: flex-start;
}
.msg.user {
  justify-content: flex-end;
}
.bubble {
  max-width: 80%;
  padding: 10px 16px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 15px;
}
.model .bubble {
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}
.user .bubble {
  background: #27ae60;
  color: white;
  border-bottom-right-radius: 4px;
}
</style>
