import dotenv from "dotenv";
import { cleanEnv, str, port, url } from "envalid";
import { AppConfig, JwtConfig } from "../interface/config.interface";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "production", "test"] }),
  PORT: port({ default: 3000 }),
  APP_URL: url({ default: "http://localhost:3000" }),
  MONGODB_URI: str(),
  JWT_ACCESS_TOKEN_SECRET: str(),
});

export const jwtConfig: JwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    expiry: process.env.JWT_ACCESS_TOKEN_EXPIRY as string,
    algorithm: "HS256" as const,
    issuer: "api-server",
  },
} as any;

export const appConfig: AppConfig = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isProduction: env.NODE_ENV === "production",
  isDevelopment: env.NODE_ENV === "development",
  isTest: env.NODE_ENV === "test",
  appUrl: env.APP_URL,
};
