<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal" @click.stop :class="modalClass">
        <div class="modal-header" v-if="!hideHeader">
          <slot name="header">
            <h2 v-if="title">{{ title }}</h2>
          </slot>
          <slot name="close-button">
            <button class="close-btn" @click="$emit('close')" aria-label="Close">×</button>
          </slot>
        </div>

        <div class="modal-content">
          <slot />
        </div>

        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  maxWidth?: string
  hideHeader?: boolean
  closeOnOverlay?: boolean
  modalClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: '500px',
  closeOnOverlay: true,
  hideHeader: false
})

const emit = defineEmits<{
  close: []
}>()

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    emit('close')
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--color-bg-card);
  border-radius: var(--border-radius-large);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: v-bind('props.maxWidth');
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;

  h2 {
    margin: 0;
    color: var(--color-text);
  }
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;

  &:hover {
    color: var(--color-text);
  }
}

.modal-content {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  background: var(--color-bg);
}
</style>
