/***********************
 * Module Dependencies *
 ***********************/
const mongoose = require('mongoose'),
  CONSTS = require('../consts/users');


const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    minlength: [1, CONSTS.ERRORS.USERNAME_MISSING],
    maxlength: [200, CONSTS.ERRORS.MAX_LENGTH_USERNAME],
    required: CONSTS.ERRORS.USERNAME_MISSING,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    minlength: [1, CONSTS.ERRORS.EMAIL_MISSING],
    maxlength: [320, CONSTS.ERRORS.MAX_LENGTH_EMAIL],
    required: CONSTS.ERRORS.EMAIL_MISSING,
    unique: true
  },
  password: {
    type: String,
    trim: true,
    minlength: [8, CONSTS.ERRORS.MINIMUM_LENGTH_PASSWORD],
    required: CONSTS.ERRORS.PASSWORD_MISSING
  }
}, { timestamps: true });


module.exports = {
  name: 'User',
  schema: UserSchema
};
