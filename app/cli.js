import db from 'app/models';
import {cache} from 'redisConnection';
import tasks from 'app/tasks';
import {handleAsyncExceptions} from 'app/util';

// the task runner
async function run(taskName, ...args) {
  const taskNames = Object.keys(tasks);
  if (taskNames.indexOf(taskName) === -1) {
    console.log(`Available Tasks: ${taskNames}`);
    return Promise.resolve(null);
  }

  try {
    return await tasks[taskName](...args);
  } catch (err) {
    throw err;
  }
}

if (require.main === module) {
  // handle async exceptions
  handleAsyncExceptions();
  // run the task runner
  const [taskName, ...args] = process.argv.slice(2);

  (async () => {
    await run(taskName, ...args);
    await new Promise((resolve) => setTimeout(async () => {
      await db.sequelize.close();
      await cache.disconnect();
      resolve();
    }, 2500));
  })();
}

export default run;


