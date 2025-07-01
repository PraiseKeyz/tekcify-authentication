import mongoose from "mongoose";
import { DbConfig } from "../interface/config.interface";
import { env } from "./app.config";
import dotenv from "dotenv";
dotenv.config();

export const dbConfig: DbConfig = {
  uri: env.MONGODB_URI,
};

export const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(dbConfig.uri);
  } catch (error) {
    throw error;
  }
};
