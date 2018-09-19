/***********************
 * Module Dependencies *
 ***********************/
const controller = require('../controllers/tasks');


module.exports = function bindRoutes(app) {
  app.route('/tasks')
    .post(controller.create)
    .get(controller.readAll);

  app.route('/tasks/:taskID')
    .get(controller.read)
    .put(controller.update)
    .delete(controller.destroy);

  app.param('taskID', controller.findTaskByID);
};
