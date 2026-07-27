<script setup lang="ts">
import type { MainTab, MainTabId } from "../types/navigation";

defineProps<{
  tabs: readonly MainTab[];
}>();

const activeTab = defineModel<MainTabId>({ required: true });
</script>

<template>
  <nav class="top-tabs" aria-label="主功能">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="top-tab"
      :class="{ 'is-active': activeTab === tab.id }"
      type="button"
      :aria-current="activeTab === tab.id ? 'page' : undefined"
      @click="activeTab = tab.id"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>
