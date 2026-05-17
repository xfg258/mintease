# MintEase

极简交互自托管网页钱包，基于 [TokenCore](https://github.com/consenlabs/token-core-monorepo)（`@consenlabs/tcx-wasm`）本地签名，UI 遵循 [token-ui](https://github.com/consenlabs/token-ui) 设计规范（语义色板、圆角、Inter 字体与卡片层级）。

## 特性

- **一键创建 / 导入**：助记词、私钥（加密为 Keystore）、Keystore JSON 文件，全程浏览器本地处理
- **极简资产**：多链网络切换、原生代币余额、地址簿
- **新手引导**：分步引导、安全横幅、误操作拦截（自转账、最终确认）
- **三步转账**：地址校验 → Gas 预估 → TokenCore 签名广播
- **双端适配**：响应式布局、收款二维码、Web Share 分享交易

## 技术栈

- Vite + React 18 + TypeScript
- TokenCore WASM（`@consenlabs/tcx-wasm`）
- ethers（私钥 → 标准 Keystore 加密，再交由 TokenCore 签名）

## 快速开始

```bash
cd wallets/mintease
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 `http://localhost:5175`）。

首次运行会自动下载 WASM 到 `public/tcx-wasm/`。也可手动执行：

```bash
npm run tcx:install
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 在线演示

- **GitHub Pages**：https://xfg258.github.io/mintease/
- **仓库**：https://github.com/xfg258/mintease

## 部署到 Vercel

1. 在 Vercel 导入本目录（或 monorepo 子目录 `wallets/mintease`）
2. Framework Preset：**Vite**
3. Build Command：`npm run build`
4. Output Directory：`dist`
5. 根目录已包含 `vercel.json`（SPA 回退）

或使用 CLI：

```bash
npx vercel --prod
```

## 安全说明

- 助记词、私钥、密码**不会**上传到任何服务器
- 数据保存在浏览器 `localStorage`，清除站点数据会丢失钱包，请务必备份助记词
- 默认推荐 **Sepolia 测试网** 体验；主网转账请自行承担风险

## 项目结构

```
wallets/mintease/
├── public/tcx-wasm/     # TokenCore WASM（postinstall 下载）
├── src/
│   ├── lib/             # TokenCore、RPC、地址簿
│   ├── components/      # 钱包 UI 组件
│   └── App.tsx
├── vercel.json
└── README.md
```

## 参考

- [token-core-monorepo](https://github.com/consenlabs/token-core-monorepo)
- [token-ui](https://github.com/consenlabs/token-ui)

## License

Apache-2.0（与 TokenCore 一致）；应用代码可自由用于 imToken 共创活动演示。
