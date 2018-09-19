/***********************
 * Module Dependencies *
 ***********************/
const mongoose = require('mongoose'),
  Task = mongoose.model('Task'),
  tasksLib = require('../libraries/tasks');


/**
 * Create a task.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function create(req, res) {
  const payload = req.body,
    errorMessage = tasksLib.validateTask(payload);

  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  const newTask = new Task(payload);
  return newTask.save((err) => {
    if (err) return res.status(500).send({ error: 'Error creating task.' });

    return res.status(201).json(newTask);
  });
}

/**
 * Read a task.
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
  Task.find().populate('notes').exec((err, tasks) => {
    if (err) return res.status(500).send({ error: 'Error fetching tasks.' });

    return res.status(200).json(tasks);
  });
}

/**
 * Update a task.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function update(req, res) {
  const payload = req.body,
    errorMessage = tasksLib.validateTask(payload);

  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  const { task } = req;

  task.description = payload.description;
  task.priority = payload.priority;
  task.notes = payload.notes;
  task.status = payload.status;

  return task.save((err) => {
    if (err) return res.status(500).send({ error: err });

    return res.status(200).json(task);
  });
}

/**
 * Destroy a task.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function destroy(req, res) {
  const { task } = req;

  return task.remove((err) => {
    if (err) return res.status(500).send({ message: 'Delete failed.' });

    return res.sendStatus(204);
  });
}

/**
 * Helper middle-ware function to look up tasks by ID.
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
      message: 'Task ID is invalid.'
    });
  }

  return Task.findById(id).populate('notes').exec((err, task) => {
    if (err) return next(err);
    if (!task) {
      return res.status(404).send({
        message: 'No task associated with that ID was found.'
      });
    }

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
