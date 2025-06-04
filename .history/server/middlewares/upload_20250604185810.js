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