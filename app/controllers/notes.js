/***********************
 * Module Dependencies *
 ***********************/
const mongoose = require('mongoose'),
  Note = mongoose.model('Note'),
  Task = mongoose.model('Task'),
  notesLib = require('../libraries/notes');


/**
 * Helper function.
 *
 * @param {String} taskID - id of the task
 * @param {Object} note - note being added
 * @param {Object} res - express response object
 * @param {Number} successStatus - status code
 */
function saveNoteInTask(taskID, note, res, successStatus) {
  Task.findById(taskID).exec((taskFindErr, task) => {
    if (taskFindErr) {
      res.status(500).send({
        error: 'Error finding associated task.'
      });
    }

    task.notes.push(note.id);
    task.save((taskSaveErr) => {
      if (taskSaveErr) {
        res.status(500).send({
          error: 'Error associating note with task.'
        });
      }

      return res.status(successStatus).json(note);
    });
  });
}

/**
 * Create a note.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function create(req, res) {
  const payload = req.body,
    errorMessage = notesLib.validateNote(payload);

  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  const newNote = new Note(payload);
  if (!newNote.task) newNote.task = req.params.taskID;
  return newNote.save((err, note) => {
    if (err) return res.status(500).send({ error: 'Error creating note.' });

    return saveNoteInTask(req.params.taskID, note, res, 201);
  });
}

/**
 * Read a note.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function read(req, res) {
  const { note } = req;
  res.status(200).json(note);
}

/**
 * Update a note.
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

  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  const { note } = req;

  note.content = payload.content;
  note.task = payload.task ? payload.task : note.task;

  return note.save((err, updatedNote) => {
    if (err) return res.status(500).send({ error: err });

    return saveNoteInTask(req.params.taskID, updatedNote, res, 200);
  });
}

/**
 * Destroy a note.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function destroy(req, res) {
  const { note } = req;

  return note.remove((err) => {
    if (err) return res.status(500).send({ message: 'Delete failed.' });

    return res.sendStatus(204);
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Note ID is invalid.'
    });
  }

  return Note.findById(id).exec((err, note) => {
    if (err) return next(err);
    if (!note) {
      return res.status(404).send({
        message: 'No note associated with this ID was found.'
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
