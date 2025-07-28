<template>
  <div class="pagination-container">
    <button @click="$emit('prev')" :disabled="currentPage === 1">Prev</button>
    <span>Page {{ currentPage }} of {{ totalPages }}</span>
    <button @click="$emit('next')" :disabled="currentPage === totalPages">Next</button>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  prev: []
  next: []
}>()
</script>

<style scoped lang="scss">
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 24px;
}

.pagination-container button {
  padding: 0.5em 1em;
  border: none;
  background: var(--color-accent-primary);
  color: var(--color-bg);
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
}
</style>
