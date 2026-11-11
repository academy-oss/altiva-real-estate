export const GCC_MARKETS = ["uae", "saudi_arabia", "qatar", "bahrain", "oman", "kuwait"] as const;

export type GccMarket = (typeof GCC_MARKETS)[number];
