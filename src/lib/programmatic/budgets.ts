import type { Budget } from "./types";

export const BUDGETS: Budget[] = [
  { id: "under-10k", slugFragment: "under-10000", shortName: "under $10,000", maxPrice: 10000 },
  { id: "under-15k", slugFragment: "under-15000", shortName: "under $15,000", maxPrice: 15000 },
  { id: "under-20k", slugFragment: "under-20000", shortName: "under $20,000", maxPrice: 20000 },
  { id: "under-25k", slugFragment: "under-25000", shortName: "under $25,000", maxPrice: 25000 },
  { id: "under-300-month", slugFragment: "under-300-month", shortName: "under $300 / month", maxMonthly: 300 },
  { id: "under-400-month", slugFragment: "under-400-month", shortName: "under $400 / month", maxMonthly: 400 },
  { id: "under-500-month", slugFragment: "under-500-month", shortName: "under $500 / month", maxMonthly: 500 },
  { id: "zero-down", slugFragment: "zero-down", shortName: "zero down", zeroDown: true },
  { id: "low-down", slugFragment: "low-down-payment", shortName: "low down payment", lowDown: true },
];

export function budgetBySlugFragment(fragment: string): Budget | undefined {
  return BUDGETS.find(b => b.slugFragment === fragment);
}
