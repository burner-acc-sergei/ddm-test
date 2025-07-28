<template>
  <main class="wrapper home-view">
    <search-form />
  </main>
</template>

<script setup lang="ts">
import SearchForm from '@/components/SearchForm.vue'
</script>

<style lang="scss" scoped>
.home-view {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: 768px) {
    padding: 1rem;
    justify-content: flex-start;
    padding-top: 3rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
    padding-top: 2rem;
  }
}
</style>
