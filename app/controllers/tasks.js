/***********************
 * Module Dependencies *
 ***********************/
const mongoose = require('mongoose'),
  Note = mongoose.model('Note'),
  Task = mongoose.model('Task'),
  tasksLib = require('../libraries/tasks');


/**
 * Creates a task.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function create(req, res) {
  const payload = req.body;

  const errorMessage = tasksLib.validateTask(payload);
  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  const newTask = new Task(payload);
  return newTask.save((err) => {
    if (err) return res.status(500).send({ error: err.message });

    return res.status(201).json(newTask);
  });
}

/**
 * Reads a task.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function read(req, res) {
  const { task } = req;
  res.status(200).json(task);
}

/**
 * Read a task.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function readAll(req, res) {
  // eslint-disable-next-line no-underscore-dangle
  Task.find({ user: req.user._id }).populate('notes').exec((err, tasks) => {
    if (err) return res.status(500).send({ error: err.message });

    return res.status(200).json(tasks);
  });
}

/**
 * Updates a task.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function update(req, res) {
  const payload = req.body;
  const errorMessage = tasksLib.validateTask(payload);

  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  const { task } = req;
  const { description, priority, status } = payload;

  task.description = description || task.description;
  task.priority = priority || task.priority;
  task.status = status || task.status;

  return task.save((err) => {
    if (err) return res.status(500).send({ error: err.message });

    return res.status(200).json(task);
  });
}

/**
 * Destroys a task and associated notes.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function destroy(req, res) {
  const { task } = req;

  return task.remove((err) => {
    if (err) return res.status(500).send({ error: err.message });

    // eslint-disable-next-line no-underscore-dangle
    return Note.deleteMany({ task: task._id }, (notesDeleteErr) => {
      if (notesDeleteErr) return res.status(500).send({ error: err.message });

      return res.sendStatus(204);
    });
  });
}

/**
 * Helper middle-ware function to look up a task by ID.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {Function} next - next function handler in express
 * @param {String} id - task ID
 * @returns {*} void
 */
function findTaskByID(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      error: 'Task ID is invalid.'
    });
  }

  return Task.findById(id).populate('notes').exec((err, task) => {
    if (err) return next(err);
    if (!task) {
      return res.status(404).send({ error: 'No task associated with that ID was found.' });
    }

    const userId = req.user._id; // eslint-disable-line no-underscore-dangle
    const taskUserId = task.user._id.toString(); // eslint-disable-line no-underscore-dangle

    if (userId !== taskUserId) return res.status(401).send({ error: 'Unauthorized access.' });

    req.task = task;
    return next();
  });
}


module.exports = {
  create,
  read,
  readAll,
  update,
  destroy,
  findTaskByID
};
