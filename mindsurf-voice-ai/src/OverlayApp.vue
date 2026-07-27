<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive } from "vue";

import {
  notifyOverlayReady,
  requestOverlayCancel,
  subscribeOverlayState,
} from "./services/overlay";
import type { OverlaySnapshot } from "./types/overlay";
import { VOICE_MODE_LABELS } from "./types/voice";

const snapshot = reactive<OverlaySnapshot>({
  assistantText: "",
  cancellable: false,
  duration: "00:00.0",
  level: 0,
  mode: "dictation",
  status: "准备录音",
  transcript: "",
});
let disposed = false;
let unlisten: (() => void) | null = null;

const displayText = computed(
  () => snapshot.assistantText || snapshot.transcript || "正在等待语音输入…",
);
const meterWidth = computed(
  () => `${Math.max(4, Math.min(100, snapshot.level * 100))}%`,
);

onMounted(() => {
  void subscribeOverlayState((next) => {
    Object.assign(snapshot, next);
  }).then((stop) => {
    if (disposed) {
      stop();
    } else {
      unlisten = stop;
      void notifyOverlayReady();
    }
  });
});

onBeforeUnmount(() => {
  disposed = true;
  unlisten?.();
});
</script>

<template>
  <main class="voice-overlay" :data-active="snapshot.cancellable">
    <div class="overlay-status">
      <span class="overlay-status-dot" aria-hidden="true"></span>
      <strong>{{ snapshot.status }}</strong>
      <span>{{ VOICE_MODE_LABELS[snapshot.mode] }}</span>
      <time>{{ snapshot.duration }}</time>
    </div>

    <p :title="displayText">{{ displayText }}</p>

    <div class="overlay-footer">
      <div class="overlay-meter" aria-label="输入音量">
        <span :style="{ width: meterWidth }"></span>
      </div>
      <button v-if="snapshot.cancellable" type="button" @click="requestOverlayCancel">
        取消
      </button>
    </div>
  </main>
</template>
