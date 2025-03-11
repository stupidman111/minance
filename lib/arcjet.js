import arcjet, { tokenBucket } from "@arcjet/next";

//这段代码的主要目的是通过 Arcjet 提供的 tokenBucket 速率限制机制来限制某个用户（通过 userId 区分）每小时最多创建 10 个集合
//防止过多的请求在短时间内导致系统过载或滥用。
const aj = arcjet({
  key: process.env.ARCJET_KEY, //连接 Arcjet 服务
  characteristics: ["userId"], // 配置了基于 userId（来自 Clerk 的身份验证）来进行速率限制跟踪。这意味着每个用户会单独被追踪和限制。
  //定义速率限制规则
  rules: [
    // tokenBucket 是 Arcjet 提供的一个速率限制工具
    tokenBucket({
      mode: "LIVE", //该设置表示实际应用中启用实时的速率限制
      refillRate: 10, // 每小时会有 10 个令牌被“补充”到桶中。这意味着每小时用户最多能创建 10 个集合。
      interval: 3600, // 3600: 表示补充的频率是每 3600 秒（即每小时一次）。
      capacity: 10, // 10: 最大容量为 10，意味着在没有令牌被消耗之前，桶中最多可以存储 10 个令牌。这个值是桶的“最大承载能力”，即允许的最大并发请求数量。
    }),
  ],
});

export default aj;
