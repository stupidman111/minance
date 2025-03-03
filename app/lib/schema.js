import { z } from "zod";

//创建账户校验数据结构
export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"), //账户名称需要至少一个字符
  type: z.enum(["CURRENT", "SAVINGS"]), //账户类型是枚举类型：CURRENT-活期，SAVINGS-储蓄
  balance: z.string().min(1, "Initial balance is required"),
  isDefault: z.boolean().default(false), //默认情况下，账户不是默认账户
});
