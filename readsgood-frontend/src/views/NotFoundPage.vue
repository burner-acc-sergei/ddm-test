<template>
  <main class="page-404 wrapper">
    <NotFound type="page" />
  </main>
</template>

<script setup lang="ts">
import NotFound from '@/components/NotFound.vue'
</script>

<style scoped lang="scss">
.page-404 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
