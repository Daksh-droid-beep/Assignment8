const taskService = require("../services/taskService");

// GET ALL TASKS
exports.getTasks = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const tasks = await taskService.getAllTasks({ search, status });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// GET SINGLE TASK BY ID
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// CREATE A NEW TASK
exports.createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const newTask = await taskService.createTask({
      title,
      description,
    });
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

// UPDATE TASK DETAILS
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const updatedTask = await taskService.updateTask(req.params.id, {
      title,
      description,
      status,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE TASK STATUS
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Status validation
    if (!status || !["pending", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be pending or completed" });
    }

    const updatedTask = await taskService.updateTaskStatus(req.params.id, status);

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE A TASK
exports.deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await taskService.deleteTask(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
