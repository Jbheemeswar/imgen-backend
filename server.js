import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoutes.js";
import imageRouter from "./routes/imageRouts.js";
import paymentRequestRoutes from "./routes/paymentRequestRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());

// connect database
connectDB();

// routes
app.use("/api/users", userRouter);
app.use("/api/image", imageRouter);
app.use("/api/payment-request", paymentRequestRoutes);
app.use("/api/payment", paymentRoutes);

// health check
app.get("/", (req, res) => {
  res.send("API Working well");
});

// start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
