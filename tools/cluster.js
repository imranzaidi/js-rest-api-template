const cluster = require('cluster');
const os = require('os');


if (cluster.isMaster) {
  // determines number of CPUs available and create a worker using fork
  const numCPUs = os.cpus().length;

  console.log(`Forking for ${numCPUs} CPUs`); // eslint-disable-line no-console
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  // start a new instance if the worker crashes
  cluster.on('exit', (worker, code, signal) => { // eslint-disable-line no-unused-vars
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(`Worker ${worker.id} crashed. Starting a new worker...`); // eslint-disable-line no-console
      cluster.fork();
    }
  });
} else {
  // starts the server if the cluster script is not the master process (isWorker === true)
  require('../server'); // eslint-disable-line global-require
}
