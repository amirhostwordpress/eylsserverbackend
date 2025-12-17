import express from "express";
import connectDB from "./config/database.js";

const app = express();

// DB connect
await connectDB();

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
console.log("DB URL exists:", !!process.env.MYSQL_PUBLIC_URL);
