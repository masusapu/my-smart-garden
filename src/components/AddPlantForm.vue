<template>
  <div class="add-form">
    <input v-model="plantName" placeholder="Tên cây..." />
    <input v-model="plantStatus" placeholder="Tình trạng (vđ: héo lá)..." />

    <div class="icon-row">
      <label
        class="icon-option"
        v-for="option in iconOptions"
        :key="option"
        :class="{ selected: selectedIcon === option }"
      >
        <input
          type="radio"
          name="plantIcon"
          :value="option"
          v-model="selectedIcon"
        />
        <span class="emoji">{{ option }}</span>
      </label>
    </div>

    <button @click="handleAdd" :disabled="loading">
      {{ loading ? "Đang thêm..." : "Thêm cây" }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const plantName = ref("");
const plantStatus = ref("");
const selectedIcon = ref("🌱");
const iconOptions = ["🌱", "🌸", "🍎", "🌵"];

const props = defineProps({
  loading: Boolean,
});

const emit = defineEmits(["add-plant"]);

const handleAdd = () => {
  if (!plantName.value || props.loading) return;
  emit("add-plant", {
    name: plantName.value,
    status: plantStatus.value,
    icon: selectedIcon.value,
  });
  plantName.value = "";
  plantStatus.value = "";
  selectedIcon.value = "🌱";
};
</script>

<style scoped>
.add-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 22px;
}
.add-form input {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(36, 123, 95, 0.18);
  background: #fbfffb;
  outline: none;
}
.add-form button {
  border: none;
  border-radius: 16px;
  background: #6bc6ff;
  color: white;
  padding: 12px 16px;
  font-weight: 600;
  cursor: pointer;
}
.add-form button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.icon-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  align-items: center;
}
.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  border: 1px solid rgba(36, 123, 95, 0.2);
  background: #f7fff6;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}
.icon-option.selected {
  border-color: #3d9d8c;
  background: #e4f8ef;
  transform: scale(1.03);
}
.icon-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.icon-option:hover {
  border-color: rgba(36, 123, 95, 0.45);
}
.icon-option input:checked + .emoji,
.icon-option .emoji {
  font-size: 1.4rem;
}
.icon-option .emoji {
  transition: transform 0.2s ease;
}
.icon-option input:checked + .emoji {
  transform: scale(1.1);
}
.emoji {
  font-size: 1.4rem;
}
</style>
