# MindSurf Voice AI Client

This is the Windows client for the MindSurf Voice AI project.

本仓库包含客户端及联调用 Mock 服务。客户端基于 Tauri 2、Vue 3 和 TypeScript，负责录音、服务通信、交互展示、文本注入和音频播放。

## 主要功能

- 听写、助手和混合模式
- 全局按住说话快捷键
- ASR、LLM 文本流式展示
- TTS 音频流式播放
- Windows 光标位置文本注入
- WebSocket 协议接入
- 用于开发联调的本地 Mock 服务

## 目录

```text
mindsurf-voice-ai/       Tauri 桌面客户端
mindsurf-voice-mock/     本地 WebSocket Mock 服务
docs/DELIVERY.md         客户端交付说明
docs/WS_PROTOCOL.md      WebSocket 接口说明
docs/PHASE1_IMPLEMENTATION.md
```

## 本地运行

需要准备 Node.js 22+、Rust stable、WebView2 和 `ffmpeg`。

先启动 Mock 服务：

```powershell
Set-Location .\mindsurf-voice-mock
npm install
npm start
```

再打开另一个终端启动客户端：

```powershell
Set-Location .\mindsurf-voice-ai
npm install
npm run tauri dev
```

Mock 服务默认地址：

```text
ws://127.0.0.1:8000/v1/voice/ws
```

客户端默认按住 `Ctrl + Win` 录音，松开后提交，按 `Escape` 取消。

交付情况见 [`docs/DELIVERY.md`](./docs/DELIVERY.md)。
