# 目标

`KeyStore` 在服务端集中管理各个 `Provider` 的密钥，这样客户端就不需要在每个请求中传递不同的密钥, 这将减少客户端调用的负担, 特别是一些特殊的 `Provider` 需要更多的信息, 比如 `Azure OpenAI`, `Bedrock`, `Vertex AI` 等, 传递它们的是一件繁琐的事情.

通过使用 `KeyStore`, 客户端只需要传递一个唯一的的 `token` 到请求的 `Authorization` 头部, 如同大多数兼容 `OpenAI` 的 `Provider` 一样, 这个 `token` 将根据在服务端的配置, 被转换为实际 `Provider` 的密钥.

# 如何使用

`KeyStore` 支持两种模式的使用方式

- 不使用主密钥: 如内网调用等不需要鉴权的场景, 此时客户端不需要传递 `token`
- 使用主密钥: 这种情况一般用于需要对请求进行鉴权的场景, 此时客户端需要传递一个根据主密钥生成的 `token` 到请求的 `Authorization` 头部. 主密钥的开启通过设置环境变量 `LLM_GATEWAY_MASTER_KEY` 为非空字符串来实现. 查看 `token-cli.ts` 来了解如何生成 `token`

# 如何配置

`KeyStore` 的
