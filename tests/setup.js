import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "../src/app.js";
import { jest } from "@jest/globals";
import { fileURLToPath } from "url";
import { dirname } from "path";

jest.setTimeout(30000);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load test environment variables
dotenv.config({ path: `${__dirname}/../.env.test` });

// Connect to MongoDB before all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Clear all collections
  await mongoose.connection.db.dropDatabase();
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

export default app;