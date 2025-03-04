"use server";

import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

const ACCOUNT_ID = "62720506-8dff-4b3d-8b05-0c025b873f90";
const USER_ID = "bc149197-4d18-4bd9-a4ca-b0651d6f759a";

// Categories with their typical amount ranges
const CATEGORIES = {
  INCOME: [
    { name: "工资收益", range: [5000, 8000] },
    { name: "基金收益", range: [1000, 3000] },
  ],
  EXPENSE: [
    { name: "房租", range: [1000, 2000] },
    { name: "交通", range: [100, 500] },
    { name: "通讯", range: [50, 200] },
    { name: "娱乐", range: [50, 200] },
    { name: "饮食", range: [50, 150] },
    { name: "购物", range: [100, 500] },
    { name: "教育", range: [100, 1000] },
    { name: "医疗", range: [50, 300] },
    { name: "旅游", range: [500, 2000] },
  ],
};

// 在一个范围内生成随机数
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// 获得随机类别与金额
function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

export async function seedTransactions() {
  try {
    // Generate 90 days of transactions
    const transactions = [];
    let totalBalance = 0;

    for (let i = 10; i >= 0; i--) {
      const date = subDays(new Date(), i);

      // Generate 1-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        // 40% chance of income, 60% chance of expense
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);

        const transaction = {
          id: crypto.randomUUID(),
          type,
          amount,
          description: `${type === "INCOME" ? "收入：" : "支出："} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: USER_ID,
          accountId: ACCOUNT_ID,
          createdAt: date,
          updatedAt: date,
        };

        totalBalance += type === "INCOME" ? amount : -amount;
        transactions.push(transaction);
      }
    }

    // Insert transactions in batches and update account balance
    await db.$transaction(async (tx) => {
      // Clear existing transactions
      await tx.transaction.deleteMany({
        where: { accountId: ACCOUNT_ID },
      });

      // Insert new transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account balance
      await tx.account.update({
        where: { id: ACCOUNT_ID },
        data: { balance: totalBalance },
      });
    });

    return {
      success: true,
      message: `Created ${transactions.length} transactions`,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}
