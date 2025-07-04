// controllers / taskControllers
import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";
import multer from "multer";

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(), // Or configure a file storage destination
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const createTask = [
  upload.array("assets"), // 'assets' should match the key in FormData
  async (req, res) => {
    try {
      const { userId } = req.user;
      const { title, team, stage, date, priority } = req.body;

      console.log("Parsed Body:", req.body);
      console.log("Uploaded Files:", req.files);

      // Validate required fields
      if (!title || !date || !priority || !team) {
        return res.status(400).json({
          status: false,
          message: `Missing required fields: ${
            !title ? "title" : ""
          } ${!date ? "date" : ""} ${
            !priority ? "priority" : ""
          } ${!team ? "team" : ""}`,
        });
      }

      console.log("team length",team.length)

      let text = "New task has been assigned to you and";
     // if (team?.length > 1) {
//text = text + ` and ${team?.length - 1} others.`;
     // }

      text =
        text +
        ` The task priority is set at ${priority} priority, so check and act accordingly. The task date is ${new Date(
          date
        ).toDateString()}. Thank you!!!`;

      const activity = {
        type: "assigned",
        activity: text,
        by: userId,
      };

      const assets = req.files.map((file) => file.originalname); // Save file names (or paths if stored)

      const task = await Task.create({
        title,
        team: JSON.parse(team), // Parse JSON string
        stage: stage.toLowerCase(),
        date,
        priority: priority.toLowerCase(),
        assets,
        activities: activity,
      });

      await Notice.create({
        team: JSON.parse(team),
        text,
        task: task._id,
      });

      res.status(200).json({ status: true, task, message: "Task created successfully." });
    } catch (error) {
      console.log("Error in createTask:", error);
      return res.status(400).json({ status: false, message: error.message });
    }
  },
];

export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    const newTask = await Task.create({
      ...task,
      title: task.title + " - Duplicate",
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    //alert users of the task
    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${
        task.priority
      } priority, so check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };

    task.activities.push(data);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    // Fetch tasks based on admin or user permissions
    const allTasks = isAdmin
      ? await Task.find({ isTrashed: false })
      : await Task.find({ isTrashed: false, team: { $all: [userId] } });

    // Fetch active users
    const users = await User.find({ isActive: true }).select(
      "name role isActive isAdmin createdAt"
    );

    // Group tasks by their stage
    const tasksByStage = allTasks.reduce((acc, task) => {
      acc[task.stage] = (acc[task.stage] || 0) + 1;
      return acc;
    }, {});

    // Total number of tasks
    const totalTasks = allTasks.length;

    // Respond with the complete task list
    res.status(200).json({
      status: true,
      summary: {
        totalTasks,
        tasks: tasksByStage,
        allTasks, // Provide the entire list of tasks
        users,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};


export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;

    // Convert `isTrashed` to a boolean if it's provided
    const query = { isTrashed: isTrashed === "true" };

    // Add stage filter if provided
    if (stage) {
      query.stage = stage;
    }

    const tasks = await Task.find(query)
      .populate({
        path: "team",
        select: "name title email", // Add team fields you need
      })
      .sort({ _id: -1 });

    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email stage assets",
      })
      .populate({
        path: "activities.by",
        select: "name",
      });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;

    const { id } = req.params;

    const newSubTask = {
      title,
      date,
      tag,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    // Log the parsed request body and files
    console.log("req",req)
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    const { title, date, priority, stage, team } = req.body;

    // Handle assets
    const assets = req.files?.map((file) => file.path) || [];

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        date,
        priority: priority?.toLowerCase() || "normal",
        stage: stage?.toLowerCase() || "todo",
        team: team ? JSON.parse(team) : [],
        assets,
      },
      { new: true }
    ).populate("team", "name email");

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};


export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);

      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: `Operation performed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
