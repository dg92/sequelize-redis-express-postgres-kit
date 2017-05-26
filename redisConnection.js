import KRedis from 'Kredis';
import config from 'config';

export default {
  cache: new KRedis(config.redis)
};
