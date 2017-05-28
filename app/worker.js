import cluster from 'cluster';
import {range, isArray} from 'lodash';

import cache from 'cache';
import runTask from 'app/cli';
import {handleAsyncExceptions} from 'app/util';

export const taskQueue = cache.queue('tasks');

async function run() {
  const numWorker = 1;
  if(cluster.isMaster) {
    console.log('Master worker init');
    await prepareCluster(cluster);
    await createWorkers(numWorker);
  } else {
    console.log('Child worker in service');
    worker();
  }
}

async function createWorkers(numWorker) {
  range(numWorker).map(() => cluster.fork());
}

function worker() {
  taskQueue.dq().then((task) => {
    if (task && task.name && isArray(task.args)) {
      console.log(task.name + ' task is executing');
      runTask(task.name, ...task.args).then(() => {
        setTimeout(() => worker(), 100);
      }).catch((err) => {
        console.log(task.name + ' task execution has error' + err);
      });
    } else {
      setTimeout(() => worker(), 100);
    }
  });
}

async function prepareCluster(cluster) {
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.id} has exited`);
    if (worker.suicide !== true) {
      console.log(`Worker ${worker.id} did not suicide, restarting`);
      cluster.fork();
    }
  });

  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
    process.on(signal, () => {
      for (const id in cluster.workers) {
        cluster.workers[id].destroy();
      }
    });
  });
}

export default run;

if (require.main === module) {
  handleAsyncExceptions();
  (async () => {
    await run(...process.argv.slice(2));
  })();
}