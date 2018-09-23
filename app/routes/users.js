/***********************
 * Module Dependencies *
 ***********************/
const controller = require('../controllers/users');


module.exports = function bindRoutes(app) {
  app.route('/users')
    .post(controller.create);

  app.route('/users/:userID')
    .get(controller.read)
    .put(controller.update)
    .delete(controller.destroy);

  app.route('/login')
    .post(controller.login);

  app.param('userID', controller.findUserByID);
};
