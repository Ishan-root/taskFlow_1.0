const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const User = require('../models/User');

// Generate human-readable project code
function generateCode() {
  const adjectives = ['alpha', 'bravo', 'cyan', 'delta', 'echo', 'foxtrot', 'gamma', 'hotel'];
  const nouns = ['team', 'squad', 'crew', 'unit', 'group', 'force', 'fleet', 'pack'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}-${noun}-${num}`;
}

// POST /api/projects/create - host creates a project
router.post('/create', auth, async (req, res) => {
  try {
    // User can only be in one project
    if (req.user.projectId) {
      return res.status(400).json({ message: 'You are already part of a project. Leave it first.' });
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    let projectCode;
    let exists = true;
    while (exists) {
      projectCode = generateCode();
      exists = await Project.findOne({ projectCode });
    }

    const project = await Project.create({
      name: name.trim(),
      projectCode,
      host: req.user._id,
      contributors: [req.user._id],
      tasks: [],
    });

    await User.findByIdAndUpdate(req.user._id, { projectId: projectCode });

    res.status(201).json({ projectCode, projectId: project._id, name: project.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/join - join a project by code
router.post('/join', auth, async (req, res) => {
  try {
    if (req.user.projectId) {
      return res.status(400).json({ message: 'You are already part of a project. Leave it first.' });
    }

    const { projectCode } = req.body;
    if (!projectCode) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findOne({ projectCode });
    if (!project) {
      return res.status(404).json({ message: 'Invalid project ID. Project not found.' });
    }

    const alreadyIn = project.contributors.some(
      (c) => c.toString() === req.user._id.toString()
    );

    if (!alreadyIn) {
      project.contributors.push(req.user._id);
      await project.save();
    }

    await User.findByIdAndUpdate(req.user._id, { projectId: projectCode });

    res.json({ projectCode, projectId: project._id, name: project.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/leave - leave the project
router.post('/leave', auth, async (req, res) => {
  try {
    if (!req.user.projectId) {
      return res.status(400).json({ message: 'You are not part of any project.' });
    }

    const project = await Project.findOne({ projectCode: req.user.projectId });
    if (project) {
      if (project.host.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Host cannot leave. Delete the project instead.' });
      }
      project.contributors = project.contributors.filter(
        (c) => c.toString() !== req.user._id.toString()
      );
      await project.save();
    }

    await User.findByIdAndUpdate(req.user._id, { projectId: null });
    res.json({ message: 'Left project successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/projects/delete - host deletes the project
router.delete('/delete', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ projectCode: req.user.projectId });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can delete the project' });
    }

    // Remove projectId from all contributors
    await User.updateMany(
      { projectId: project.projectCode },
      { $set: { projectId: null } }
    );

    await Project.deleteOne({ _id: project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/projects/my - get the project the user belongs to
router.get('/my', auth, async (req, res) => {
  try {
    if (!req.user.projectId) {
      return res.json(null);
    }
    const project = await Project.findOne({ projectCode: req.user.projectId })
      .populate('host', 'username email')
      .populate('contributors', 'username email')
      .populate('tasks.assignedTo', 'username email');

    if (!project) {
      // Clean up stale reference
      await User.findByIdAndUpdate(req.user._id, { projectId: null });
      return res.json(null);
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/projects/tasks - host adds a task to the project
router.post('/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ projectCode: req.user.projectId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the host can add tasks' });
    }

    const { title, assignedTo, deadline } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Task title is required' });
    if (!deadline) return res.status(400).json({ message: 'Deadline is required' });

    const newTask = {
      title: title.trim(),
      assignedTo: assignedTo || null,
      deadline,
      status: 'To Do',
      order: project.tasks.length,
    };

    project.tasks.push(newTask);
    await project.save();

    const saved = await Project.findOne({ projectCode: req.user.projectId })
      .populate('tasks.assignedTo', 'username email');

    res.status(201).json(saved.tasks[saved.tasks.length - 1]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/tasks/:taskId - update a project task (all members can update status; only host can edit details)
router.put('/tasks/:taskId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ projectCode: req.user.projectId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = project.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isHost = project.host.toString() === req.user._id.toString();
    const { title, assignedTo, deadline, status, order } = req.body;

    // Status updates allowed for all contributors (for Kanban drag)
    if (status !== undefined) task.status = status;
    if (order !== undefined) task.order = order;

    // Only host can update details
    if (isHost) {
      if (title !== undefined) task.title = title.trim();
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (deadline !== undefined) task.deadline = deadline;
    }

    await project.save();

    const updated = await Project.findOne({ projectCode: req.user.projectId })
      .populate('tasks.assignedTo', 'username email');
    const updatedTask = updated.tasks.id(req.params.taskId);
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/projects/tasks/bulk/reorder
router.put('/tasks/bulk/reorder', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ projectCode: req.user.projectId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { tasks } = req.body; // [{ id, order, status }]
    tasks.forEach(({ id, order, status }) => {
      const task = project.tasks.id(id);
      if (task) {
        if (order !== undefined) task.order = order;
        if (status !== undefined) task.status = status;
      }
    });

    await project.save();
    res.json({ message: 'Reordered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
