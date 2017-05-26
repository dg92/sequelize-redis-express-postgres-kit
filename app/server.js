import config from 'app/http/config';
import http from 'app/http';

async function run() {
  if(process.env.NODE_ENV === 'production') {
    console.log('production env');
  } else {
    http.listen(config.port, config.host, () => {
      console.log(`app running on http://${config.host}:${config.port}`);
    });
  }
}

export default run;

if (require.main === module) {
  run();
} else {
  console.log('required as a module');
}
