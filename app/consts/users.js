/***********************
 * Module Dependencies *
 ***********************/
const utils = require('../../config/libraries/utils');


const USERNAME_MISSING = 'Username cannot be blank!',
  PASSWORD_MISSING = 'Password cannot be blank!',
  EMAIL_MISSING = 'Email cannot be blank!',
  MAX_LENGTH_USERNAME = 'Username cannot be longer than 200 characters!',
  MINIMUM_LENGTH_PASSWORD = 'Password must be at least 8 characters!',
  MAX_LENGTH_EMAIL = 'Username cannot be longer than 320 characters!',
  ERRORS = {
    USERNAME_MISSING,
    PASSWORD_MISSING,
    EMAIL_MISSING,
    MAX_LENGTH_USERNAME,
    MINIMUM_LENGTH_PASSWORD,
    MAX_LENGTH_EMAIL
  };


const exportedObject = utils.deepFreeze({ ERRORS });

module.exports = exportedObject;
