<template>
  <div class="plant-list">
    <div
      v-for="plant in plants"
      :key="plant.id"
      :class="['plant-item', { active: selectedPlant?.id === plant.id }]"
      @click="$emit('select-plant', plant)"
    >
      <span class="plant-icon" aria-hidden="true">{{
        plant.icon || "🌱"
      }}</span>
      <span class="plant-info">
        <strong>{{ plant.name }}</strong>
        <small>{{ plant.status }}</small>
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  plants: Array,
  selectedPlant: Object,
});

defineEmits(["select-plant"]);
</script>

<style scoped>
.plant-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-gutter: stable;
}
.plant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid rgba(38, 183, 123, 0.18);
  cursor: pointer;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
}
.plant-item.active {
  background: #dff7ee;
  border-color: #27ae60;
}
.plant-icon {
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
.plant-info {
  min-width: 0;
}
.plant-item strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 2px;
}
.plant-item small {
  color: #576d52;
  display: block;
  line-height: 1.3;
}
</style>
