# Windows 构建与发布

## 系统要求

- Windows 10/11 x64；
- Node.js 22+、Rust stable；
- Microsoft Edge WebView2 Runtime；
- 构建 MSI 时需要 Windows 的 VBSCRIPT 可选功能，GitHub 托管 runner 默认提供。

## 本地验证

```powershell
cd mindsurf-voice-ai
npm ci
npm run check
npm run tauri build -- --bundles nsis
```

Tauri 会在 `src-tauri/target/release/bundle/nsis` 下生成 `.exe` 安装包。日常 CI 的
`Windows quality gate` 负责编译和测试 Windows 原生代码，`Windows installers`
进一步生成未签名的 Debug NSIS 安装包，确保安装包链路不会只在发布时才被验证。

## GitHub Release

`.github/workflows/release-desktop.yml` 在 `v*` tag 或手动触发时执行以下流程：

1. 校验 `tauri.conf.json`、`package.json`、`Cargo.toml` 和 tag 版本一致；
2. 构建 ad-hoc 签名但未公证的 Universal macOS DMG，创建 Draft Release；
3. 构建未签名的 Windows x64 NSIS 安装包，上传到同一个 Draft Release；
4. 两个平台构建成功后，由维护者检查产物并发布 Draft Release。

发布工作流不需要 Windows 代码签名证书或 Repository Secrets。安装时 Windows 会
显示“未知发布者”，SmartScreen 也可能拦截；确认安装包来自本仓库 Release 后，可
选择“更多信息 → 仍要运行”。

发布 tag 必须与客户端版本一致，例如客户端版本为 `0.2.0` 时使用 `v0.2.0`。
工作流创建的是 Draft Release；应在两个平台的安装验收完成后再由维护者手动发布。

## 发布前人工验收

- 在干净的 Windows 10 和 Windows 11 x64 环境安装 NSIS；
- 确认“未知发布者”和 SmartScreen 提示下的手动放行流程可用；
- 验证 WebView2 检测、系统浏览器登录回跳和 Windows Credential Manager；
- 验证全局快捷键、麦克风、文本注入、托盘和关闭隐藏行为；
- 启用登录自启动后注销再登录，确认仅驻留托盘且任务管理器状态同步；
- 从 `0.1.x` 升级到 `0.2.0`，再执行卸载，确认程序文件和失效自启动项不会残留。
