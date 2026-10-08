import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return mongoose.connection;

  if (!env.DB_URI) {
    console.warn("DB_URI not set");
    return null;
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
  });

  const conn = await mongoose.connect(env.DB_URI, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });

  isConnected = true;
  console.log(`MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);
  return conn;
};

export const isDbReady = () => mongoose.connection.readyState === 1;
export const getDb = () => mongoose.connection.db;