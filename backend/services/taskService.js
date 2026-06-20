const Task = require("../models/taskModel");

/**
 * Service to handle all Task MongoDB interactions
 */
class TaskService {
  /**
   * Get all tasks with optional search and status filtering
   */
  async getAllTasks(query = {}) {
    const filter = {};

    // Apply search filter if query.search exists
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: "i" } },
        { description: { $regex: query.search, $options: "i" } },
      ];
    }

    // Apply status filter if query.status exists and is valid
    if (query.status && ["pending", "completed"].includes(query.status)) {
      filter.status = query.status;
    }

    // Return tasks sorted by creation date descending (newest first)
    return await Task.find(filter).sort({ createdAt: -1 });
  }

  /**
   * Get a single task by ID
   */
  async getTaskById(id) {
    return await Task.findById(id);
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const task = new Task(taskData);
    return await task.save();
  }

  /**
   * Update a task's fields
   */
  async updateTask(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, {
      new: true, // Return the modified document
      runValidators: true, // Run model schema validations
    });
  }

  /**
   * Update a task's status
   */
  async updateTaskStatus(id, status) {
    return await Task.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  /**
   * Delete a task
   */
  async deleteTask(id) {
    return await Task.findByIdAndDelete(id);
  }
}

module.exports = new TaskService();
