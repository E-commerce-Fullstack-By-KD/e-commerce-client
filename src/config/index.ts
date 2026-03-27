export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "ShopEase",
} as const;
