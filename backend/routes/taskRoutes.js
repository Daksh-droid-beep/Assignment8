const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { validateTaskCreate, validateTaskUpdate } = require("../middlewares/validationMiddleware");

// Route mappings
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTaskById);
router.post("/", validateTaskCreate, taskController.createTask);
router.put("/:id", validateTaskUpdate, taskController.updateTask);
router.patch("/:id/status", taskController.updateTaskStatus);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
