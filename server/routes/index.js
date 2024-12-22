// routes/index.js
import express from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";

const router = express.Router();

router.use("/user", userRoutes); //api/user/login  // Routes for user-related actions
router.use("/task", taskRoutes); // Routes for task-related actions

export default router;
