/***********************
 * Module Dependencies *
 ***********************/
const mongoose = require('mongoose'),
  Note = mongoose.model('Note'),
  Task = mongoose.model('Task'),
  notesLib = require('../libraries/notes');


/**
 * Helper function for adding notes to associated task.
 *
 * @param {String} taskID - id of the task
 * @param {Object} note - note being added
 * @param {Object} res - express response object
 * @param {Number} successStatus - status code
 */
function saveNoteInTask(taskID, note, res, successStatus) {
  Task.findById(taskID).exec((taskFindErr, task) => {
    if (taskFindErr) {
      res.status(500).send({ error: taskFindErr.message });
    }

    task.notes.push(note.id);
    task.save((taskSaveErr) => {
      if (taskSaveErr) {
        res.status(500).send({ error: taskSaveErr.message });
      }

      return res.status(successStatus).json(note);
    });
  });
}

/**
 * Creates a note.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function create(req, res) {
  const userId = req.user._id; // eslint-disable-line no-underscore-dangle
  const taskUserId = req.task.user._id.toString(); // eslint-disable-line no-underscore-dangle

  if (userId !== taskUserId) return res.status(401).send({ error: 'Unauthorized access.' });

  const payload = req.body,
    errorMessage = notesLib.validateNote(payload);

  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  const newNote = new Note(payload);
  if (!newNote.task) newNote.task = req.params.taskID;

  return newNote.save((err, note) => {
    if (err) return res.status(500).send({ error: err.message });

    return saveNoteInTask(req.params.taskID, note, res, 201);
  });
}

/**
 * Reads a note.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function read(req, res) {
  const { note } = req;
  res.status(200).json(note);
}

/**
 * Updates a note.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function update(req, res) {
  const payload = req.body,
    errorMessage = notesLib.validateNote(payload);

  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  const { note } = req;

  note.content = payload.content;
  note.task = payload.task ? payload.task : note.task;

  return note.save((err, updatedNote) => {
    if (err) return res.status(500).send({ error: err.message });

    return saveNoteInTask(req.params.taskID, updatedNote, res, 200);
  });
}

/**
 * Destroys a note and removes it from the task notes.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function destroy(req, res) {
  const { note } = req;

  return Task.findById(note.task).exec((taskFindErr, task) => {
    if (taskFindErr) return res.status(500).send({ error: taskFindErr.message });

    // eslint-disable-next-line no-underscore-dangle, no-param-reassign
    task.notes = task.notes.filter(noteId => !noteId.equals(note._id));
    return task.save((saveErr) => {
      if (saveErr) return res.status(500).send({ error: saveErr.message });

      return note.remove((err) => {
        if (err) return res.status(500).send({ error: err.message });

        return res.sendStatus(204);
      });
    });
  });
}

/**
 * Helper middle-ware function to look up notes by ID.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {Function} next - next function handler in express
 * @param {String} id - note ID
 * @returns {*} void
 */
function findNoteByID(req, res, next, id) {
  const userId = req.user._id; // eslint-disable-line no-underscore-dangle
  const taskUserId = req.task.user._id.toString(); // eslint-disable-line no-underscore-dangle

  if (userId !== taskUserId) return res.status(401).send({ error: 'Unauthorized access.' });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      error: 'Note ID is invalid.'
    });
  }

  return Note.findById(id).exec((err, note) => {
    if (err) return next(err);
    if (!note) {
      return res.status(404).send({
        error: 'No note associated with this ID was found.'
      });
    }

    req.note = note;
    return next();
  });
}


module.exports = {
  create,
  read,
  update,
  destroy,
  findNoteByID
};
