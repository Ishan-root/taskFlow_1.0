const mongoose = require('mongoose');

const projectTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Completed'],
      default: 'To Do',
    },
    deadline: { type: Date, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    projectCode: { type: String, required: true, unique: true },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tasks: [projectTaskSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
