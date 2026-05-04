# TOTP-Auth

谷歌验证器克隆 — Cloudflare Workers + KV 存储，随时随地查看 2FA 验证码。

## 功能
- 🔐 主页：PIN 验证后查看所有验证码，30s 自动刷新
- ⚙️ 后台：添加/编辑/删除 2FA 账户，支持备注
- ☁️ KV 存储：密钥云端存储，多设备同步
- 🌙 深色模式：跟随系统自动切换
- 📱 移动端友好

## 部署

### 1. 创建 KV 命名空间
```bash
wrangler kv:namespace create TOTP_KV
wrangler kv:namespace create TOTP_KV --preview
```
把输出的 `id` 填入 `wrangler.toml`。

### 2. 部署 Worker
```bash
wrangler deploy
```

### 3. 使用
- 首次访问：自动初始化，设置 6 位 PIN
- 进后台 `/admin` 添加账户
- 主页 `/` 查看验证码

## 测试密钥
```
账户名: Google Test
密钥: JBSWY3DPEHPK3PXP
```
用 Google Authenticator 扫同一密钥验证码匹配即为正常。

## 安全说明
- PIN 使用 PBKDF2-SHA256 (100000次) 哈希后存入 KV
- Secret 密钥存储于 KV，不对外暴露
- 所有 API 需 PIN Hash 验证

## License
MIT
