import express from "express";
import connectDB from "./config/database.js";

const app = express();

await connectDB();

app.get("/", (req, res) => res.send("Backend running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
