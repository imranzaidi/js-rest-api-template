/***********************
 * Module Dependencies *
 ***********************/
const CONSTS = require('../consts/users');


/**
 * Validates a user payload.
 *
 * @param {Object} user
 * @param {boolean} ignorePassword
 */
function validateUser(user, ignorePassword) {
  let errorMessage;

  if (!user.username) { return CONSTS.ERRORS.USERNAME_MISSING; }
  if (!user.email) { return CONSTS.ERRORS.EMAIL_MISSING; }
  if (!user.password && !ignorePassword) { return CONSTS.ERRORS.PASSWORD_MISSING; }

  return errorMessage;
}

module.exports = {
  validateUser
};
