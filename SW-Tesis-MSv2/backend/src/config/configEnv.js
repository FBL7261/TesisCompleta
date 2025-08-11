"use strict";
import path from "node:path";
const __dirname = import.meta.dirname;

const envFilePath = path.resolve(__dirname, ".env");
import dotenv from "dotenv";
dotenv.config({ path: envFilePath });

export const PORT = process.env.PORT;

export const HOST = process.env.HOST;

export const DB_URL = process.env.DB_URL;

export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;

export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET;
