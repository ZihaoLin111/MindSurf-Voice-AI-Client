# MindSurf Voice AI

MindSurf Voice AI 的 Windows 桌面客户端，基于 Tauri 2、Vue 3 和 TypeScript。

当前完成 Phase 1 的 M3：客户端支持听写、助手和混合模式、ASR/LLM 流式文本、Windows `SendInput` Unicode 文本注入，以及可配置的全局按住说话快捷键。默认按住 `Ctrl + Win` 录音，任一组合键释放后提交，`Escape` 取消当前请求。

## 环境要求

- Node.js 22+
- Rust stable
- Windows 10/11 与 WebView2

## 本地开发

```powershell
npm install
npm run tauri dev
```

调试阶段默认连接本地 mock 服务：

```text
ws://127.0.0.1:8000/v1/voice/ws
```

可以通过 `VITE_VOICE_SERVICE_URL` 覆盖服务地址。独立 mock 服务位于客户端同级目录 `../mindsurf-voice-mock`：

```powershell
Set-Location ..\mindsurf-voice-mock
npm install
npm start
```

## 质量检查

```powershell
npm run check
npm run build

Set-Location src-tauri
cargo fmt --all -- --check
cargo check --all-targets
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
```

`npm run check` 会执行 Prettier、ESLint、TypeScript 和音频工具单元测试。

## 目录

```text
src/
├─ components/    UI 组件
├─ audio/         重采样、PCM16、分帧与 WAV
├─ composables/   Vue 业务组合逻辑
├─ services/      Tauri 与外部服务适配
├─ stores/        客户端业务状态
├─ styles/        全局样式
└─ types/         TypeScript 领域类型

src-tauri/src/
├─ commands/      Tauri commands
├─ error.rs       统一命令结果与错误类型
├─ lib.rs         Tauri 应用入口
└─ main.rs        Windows 进程入口
```

协议与实现基线见仓库根目录的 `PHASE1_IMPLEMENTATION.md` 和 `WS_PROTOCOL.md`。
