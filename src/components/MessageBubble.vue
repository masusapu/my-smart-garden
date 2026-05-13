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
  margin-bottom: 14px;
  text-align: left;
}
.msg.model {
  justify-content: flex-start;
}
.msg.user {
  justify-content: flex-end;
}
.bubble {
  max-width: 78%;
  padding: 14px 18px;
  border-radius: 24px;
  line-height: 1.7;
  font-size: 15px;
}
.model .bubble {
  background: #ffffff;
  border: 1px solid rgba(143, 198, 185, 0.35);
  color: #334d3c;
  border-bottom-left-radius: 12px;
}
.user .bubble {
  background: #27ae60;
  color: white;
  border-bottom-right-radius: 12px;
}
</style>
