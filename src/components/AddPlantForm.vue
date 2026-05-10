<template>
  <div class="add-form">
    <input v-model="plantName" placeholder="Tên cây..." />
    <input v-model="plantStatus" placeholder="Tình trạng (vđ: héo lá)..." />
    <button @click="handleAdd" :disabled="loading">
      {{ loading ? "Đang thêm..." : "Thêm cây" }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const plantName = ref("");
const plantStatus = ref("");

const props = defineProps({
  loading: Boolean,
});

const emit = defineEmits(["add-plant"]);

const handleAdd = () => {
  if (!plantName.value || props.loading) return;
  emit("add-plant", {
    name: plantName.value,
    status: plantStatus.value,
  });
  plantName.value = "";
  plantStatus.value = "";
};
</script>

<style scoped>
.add-form {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 20px;
}
</style>
