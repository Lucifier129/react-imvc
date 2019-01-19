# CHANGELOG

## 2.1.0

- 升级 gulp 套件到 v4.x 版本
- 支持打包出 `server-bundle.js`

```javascript
// imvc.config.js
{
  useServerBundle: true, // 开启 serverBundle 模式
  serverBundleName: 'server.bunlde.js', // 如需修改 serverBundle 的文件名，配置该字段
}
```