<script setup lang="ts">
import { useVoiceSessionStore } from "../stores/voiceSession";
import ConnectionBadge from "./ConnectionBadge.vue";

const session = useVoiceSessionStore();
</script>

<template>
  <section class="panel" aria-labelledby="connection-title">
    <header class="panel-heading">
      <div>
        <h1 id="connection-title">服务连接</h1>
        <p class="panel-description">WebSocket 协议版本、握手状态和重连信息。</p>
      </div>
      <ConnectionBadge :status="session.state.connectionStatus" />
    </header>

    <div class="panel-body">
      <div class="connection-grid">
        <article class="detail-card">
          <span class="detail-label">服务地址</span>
          <code>{{ session.state.serviceUrl }}</code>
        </article>
        <article class="detail-card">
          <span class="detail-label">协议状态</span>
          <strong v-if="session.state.serverHello">
            v{{ session.state.serverHello.protocol_version }} ·
            {{ session.state.serverHello.pipeline }}
          </strong>
          <strong v-else>{{ session.connectionLabel }}</strong>
        </article>
        <article class="detail-card">
          <span class="detail-label">会话</span>
          <strong>
            {{ session.state.serverHello?.session_id ?? "尚未建立" }}
          </strong>
        </article>
        <article class="detail-card">
          <span class="detail-label">重连次数</span>
          <strong>{{ session.state.reconnectAttempt }}</strong>
        </article>
      </div>

      <div v-if="session.state.lastError" class="connection-error">
        <span>{{ session.state.lastError }}</span>
        <button
          class="button button-secondary"
          type="button"
          @click="session.retryConnection"
        >
          立即重试
        </button>
      </div>
    </div>
  </section>
</template>
