<template>
  <div class="sidebar">
    <h2>🌿 Vườn Của Tôi</h2>
    <AddPlantForm
      :loading="addingLoading"
      @add-plant="$emit('add-plant', $event)"
    />
    <PlantList
      :plants="plants"
      :selected-plant="selectedPlant"
      @select-plant="$emit('select-plant', $event)"
    />
  </div>
</template>

<script setup>
import AddPlantForm from "./AddPlantForm.vue";
import PlantList from "./PlantList.vue";

defineProps({
  plants: Array,
  selectedPlant: Object,
  addingLoading: Boolean,
});

defineEmits(["add-plant", "select-plant"]);
</script>

<style scoped>
.sidebar {
  width: 320px;
  background: #ffffff;
  border-radius: 28px;
  border: 1px solid rgba(150, 200, 170, 0.35);
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  box-shadow: 0 16px 32px rgba(120, 140, 120, 0.08);
}
.sidebar h2 {
  margin-bottom: 18px;
  font-size: 1.55rem;
  letter-spacing: 0.02em;
  color: #2f6b4f;
}
</style>
