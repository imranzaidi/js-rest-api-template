/***********************
 * Module Dependencies *
 ***********************/
const chalk = require('chalk'),
  express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  helmet = require('helmet'),
  jsonwebtoken = require('jsonwebtoken'),
  methodOverride = require('method-override'),
  path = require('path'),
  logger = require('./logger');


/**
 * Middleware that facilitates user login and auth.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Promise<*>}
 */
async function addUser(req, res, next) {
  const token = req.headers.authorization;
  const loginOrRegister = req.originalUrl === '/login' || (
    req.originalUrl === '/users' && req.method === 'POST'
  );

  if (!loginOrRegister) {
    try {
      // eslint-disable-next-line max-len
      const { user } = await jsonwebtoken.verify(token, process.env.SECRET || 'ADFEdfiaef12345134asdfkWEFasdase1345rhASDF23');
      req.user = user;
    } catch (err) {
      console.log(chalk.red('Authorization:'), err); // eslint-disable-line no-console

      res.status(401);
      return res.send({ error: err.message });
    }
  }

  return next();
}

/**
 * Initialize middleware.
 *
 * @param {Object} app - express application instance
 * @param {Object} config - application configuration
 */
function initializeMiddleware(app, config) {
  // parsing requests
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // logging
  app.use(morgan('common', {
    stream: logger.stream
  }));

  // lets simple clients' requests simulate DELETE and PUT
  app.use(methodOverride());

  // secure HTTP headers
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.xssFilter());
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
  if (config.app.env === 'development') {
    app.use(helmet.noCache());
  }

  app.use(addUser);
}

/**
 * Set up routes.
 *
 * @param {Object} app - express application instance
 * @param {Array} routePaths - an list of string with the relative path to each route
 */
function loadRoutes(app, routePaths) {
  routePaths.forEach((routePath) => {
    const bindRoutes = require(path.resolve(routePath)); // eslint-disable-line
    bindRoutes(app);
  });
}

/**
 * Initializes Express application.
 *
 * @param {Object} config - application configuration
 * @returns {Object} app - express application instance
 */
function initialize(config) {
  const app = express();

  this.initializeMiddleware(app, config);
  this.loadRoutes(app, config.paths.routes);

  return app;
}

/**
 * Start the server.
 *
 * @param {Object} app - express application instance
 * @param {Object} config - application configuration
 */
function startApp(app, config) {
  app.listen(config.app.port, config.app.host, () => {
    console.info(chalk.blue(`We are live on port ${config.app.port}:`)); // eslint-disable-line no-console
  });
}


module.exports = {
  initializeMiddleware,
  loadRoutes,
  initialize,
  startApp
};
