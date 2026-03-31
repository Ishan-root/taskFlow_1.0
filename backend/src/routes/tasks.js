const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// GET /api/tasks - get all personal tasks for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ order: 1, createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks - create a new personal task
router.post('/', auth, async (req, res) => {
  try {
    const { title, deadline } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task name is required' });
    }
    if (!deadline) {
      return res.status(400).json({ message: 'Deadline is required' });
    }

    const count = await Task.countDocuments({ userId: req.user._id });
    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      deadline,
      status: 'To Do',
      order: count,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id - update a personal task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, deadline, status, order } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: 'Task name is required' });
      task.title = title.trim();
    }
    if (deadline !== undefined) {
      if (!deadline) return res.status(400).json({ message: 'Deadline is required' });
      task.deadline = deadline;
    }
    if (status !== undefined) task.status = status;
    if (order !== undefined) task.order = order;

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/reorder - bulk update orders
router.put('/bulk/reorder', auth, async (req, res) => {
  try {
    const { tasks } = req.body; // [{ id, order, status }]
    const ops = tasks.map((t) => ({
      updateOne: {
        filter: { _id: t.id, userId: req.user._id },
        update: { $set: { order: t.order, status: t.status } },
      },
    }));
    await Task.bulkWrite(ops);
    res.json({ message: 'Reordered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
