// Import necessary modules and configure dotenv
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middlewares/errorMiddlewares.js";
import routes from "./routes/index.js";
import connectDb from './config/db.js'; 
import { createJWT } from './utils/jwt.js'; 

// Configure environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set the PORT
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDb();

// Enable CORS
app.use(
  cors({
    origin: ["https://workhub-manager.onrender.com"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// API routes
app.use("/api", routes);

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API!",
    routes: {
      summary: "/api/summary",
    },
  });
});

// Error handling
app.use(routeNotFound);
app.use(errorHandler);

// Start server and bind to port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


