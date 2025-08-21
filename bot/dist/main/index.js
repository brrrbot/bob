import dotenv from "dotenv";
import { createClient } from "./init.js";
// Get Bot Tokens
dotenv.config();
const tokens = process.env.TOKENS?.split(",").map(t => t.trim()) || [];
// Validate Token Count
if (tokens.length === 0) {
    console.error("No bot tokens found!");
    process.exit(1);
}
// Create and Login Client for each Token
tokens.forEach((token) => {
    createClient().login(token);
});
