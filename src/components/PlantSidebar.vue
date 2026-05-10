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
  width: 300px;
  border-right: 1px solid #eee;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
</style>
