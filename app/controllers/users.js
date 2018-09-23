/***********************
 * Module Dependencies *
 ***********************/
const _ = require('lodash'),
  bcrypt = require('bcrypt'),
  jsonwebtoken = require('jsonwebtoken'),
  mongoose = require('mongoose'),
  usersLib = require('../libraries/users'),
  Task = mongoose.model('Task'),
  User = mongoose.model('User');


/**
 * Creates a user.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
async function create(req, res) {
  const payload = req.body,
    errorMessage = usersLib.validateUser(payload, false);

  if (errorMessage) {
    return res.status(400).send({ error: errorMessage });
  }

  payload.password = await bcrypt.hash(payload.password, 12);
  const newUser = new User(payload);
  return newUser.save((err, user) => {
    if (err) return res.status(500).send({ error: err.message });

    const { _id, username, email, createdAt, updatedAt } = user;
    return res.status(201).json({ _id, username, email, createdAt, updatedAt });
  });
}

/**
 * Reads a note.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function read(req, res) {
  const { user } = req;
  const { _id, username, email, createdAt, updatedAt } = user;
  res.status(200).json({ _id, username, email, createdAt, updatedAt });
}

/**
 * Updates a user.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
async function update(req, res) {
  const payload = req.body;

  const { user } = req;

  user.username = payload.username ? payload.username : user.username;
  user.email = payload.email ? payload.email : user.email;
  const newPassword = payload.password;
  if (newPassword && typeof newPassword === 'string' && newPassword.length >= 8) {
    user.password = await bcrypt.hash(payload.password, 12);
  }

  return user.save((err, updatedUser) => {
    if (err) return res.status(500).send({ error: err });

    const { _id, username, email, createdAt, updatedAt } = updatedUser;
    return res.status(200).json({ _id, username, email, createdAt, updatedAt });
  });
}

/**
 * Destroys a user and associated tasks.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function destroy(req, res) {
  const { user } = req;

  // eslint-disable-next-line no-underscore-dangle
  return User.findById(user._id).exec({ email: user.email }, (findErr, fetchedUser) => {
    if (findErr) return res.status(500).send({ error: findErr.message });

    return fetchedUser.remove((deleteErr) => {
      if (deleteErr) return res.status(500).send({ error: deleteErr.message });

      // eslint-disable-next-line no-underscore-dangle
      return Task.deleteMany({ user: fetchedUser._id }, (taskDeleteErr) => {
        if (taskDeleteErr) {
          return res.status(500).send({ error: taskDeleteErr.message });
        }

        return res.sendStatus(204);
      });
    });
  });
}

/**
 * Logs a user in and return a JSONWebtoken.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 */
function login(req, res) {
  const { email, password } = req.body;

  return User.findOne({ email }, (err, user) => {
    if (err) return res.status(400).send({ error: 'User lookup failed.' });

    if (!user) return res.status(400).send({ error: 'No user by that email.' });

    const valid = bcrypt.compareSync(password, user.password);

    if (!valid) { return res.status(401).send('Invalid password.'); }
    const token = jsonwebtoken.sign(
      { user: _.pick(user, ['_id', 'username', 'email']) },
      process.env.SECRET || 'ADFEdfiaef12345134asdfkWEFasdase1345rhASDF23',
      { expiresIn: '2h' },
    );

    return res.status(200).send(token);
  });
}

/**
 * Helper middle-ware function to look up a user by ID.
 *
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {Function} next - next function handler in express
 * @param {String} id - note ID
 * @returns {*} void
 */
function findUserByID(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'User ID is invalid.' });
  }

  return User.findById(id).exec((err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(404).send({
        error: 'No user associated with this ID was found.'
      });
    }

    const { _id, username, email, createdAt, updatedAt } = user;
    req.user = { _id, username, email, createdAt, updatedAt };
    return next();
  });
}


module.exports = {
  create,
  read,
  update,
  destroy,
  login,
  findUserByID
};
