# Subs Helper - GitHub Proxy on Cloudflare Pages

一个简单的 GitHub 代码代理工具，通过 Cloudflare Pages Functions 实现。

## 功能
- 通过 `?access_key=xxx` 验证访问。
- 自动使用配置的 `GITHUB_TOKEN` 代理请求 GitHub 私有或公共仓库代码。
- 包含管理界面，可配置 `ACCESS_KEY`、`GITHUB_TOKEN`、默认仓库等信息。

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 在 `.env` 中设置 `ADMIN_KEY`（已预设）。

3. 启动开发服务器：
   ```bash
   npx wrangler pages dev public --kv SUBS_KV
   ```
   *注意：首次运行可能需要按照提示创建本地 KV。*

## 部署到 Cloudflare Pages

1. **创建项目**：在 Cloudflare Dashboard 中创建一个新的 Pages 项目。
2. **设置环境变量**：
   - 在 Settings -> Functions -> Environment variables 中添加 `ADMIN_KEY`。
3. **设置 KV 绑定**：
   - 在 Workers & Pages -> KV -> Create Namespace 创建一个名为 `subs-helper-kv` 的命名空间。
   - 在 Pages 项目的 Settings -> Functions -> KV namespace bindings 中，添加一个绑定：
     - Variable name: `SUBS_KV`
     - KV namespace: 选择你刚才创建的命名空间。
4. **部署代码**：将代码推送到 GitHub 并连接到 Pages，或者使用 `npm run deploy`。

## 使用方法

1. 访问部署后的域名，输入 `ADMIN_KEY` 登录。
2. 配置 `ACCESS_KEY` 和 `GITHUB_TOKEN`。
3. 使用格式：`https://your-domain.pages.dev/?access_key=YOUR_KEY&path=/path/to/file.py`
