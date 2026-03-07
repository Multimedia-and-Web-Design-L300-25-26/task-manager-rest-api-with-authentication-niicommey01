import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// POST /api/tasks
router.post("/", async (req, res) => {
  // - Create task
  // - Attach owner = req.user._id
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const task = new Task({
      title,
      description,
      owner: req.user._id,
    });

    await task.save();

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
});


// GET /api/tasks
router.get("/", async (req, res) => {
  // - Return only tasks belonging to req.user
  try {
    const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
});


// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  // - Check ownership
  // - Delete task
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      })
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this task",
      })
    }

    await task.deleteOne();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
});

export default router;