<template>
  <div class="plant-list">
    <div
      v-for="plant in plants"
      :key="plant.id"
      :class="['plant-item', { active: selectedPlant?.id === plant.id }]"
      @click="$emit('select-plant', plant)"
    >
      <strong>{{ plant.name }}</strong
      ><br />
      <small>{{ plant.status }}</small>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plants: Array,
  selectedPlant: Object,
});

defineEmits(["select-plant"]);
</script>

<style scoped>
.plant-item {
  padding: 10px;
  border: 1px solid #ddd;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 8px;
}
.plant-item.active {
  background: #e6f7ed;
  border-color: #27ae60;
}
</style>
