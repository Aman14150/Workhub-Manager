import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middlewares/errorMiddlewares.js";
import routes from "./routes/index.js";
import connectDb from './config/db.js'; // Importing DB connection
import { createJWT } from './utils/jwt.js';  // Importing JWT utility

// Establish database connection
dotenv.config();

const PORT = process.env.PORT || 5000;
// Establish database connection
connectDb(); // Call this function here

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(express.json());  // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies

app.use(cookieParser());  // Parse cookies

app.use(morgan("dev"));  // Log HTTP requests

// API routes
app.use("/api", routes);

// Error handling middleware
app.use(routeNotFound);
app.use(errorHandler);

// Serve 'uploads' folder as static
// This will make 'uploads/' folder public and accessible
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
