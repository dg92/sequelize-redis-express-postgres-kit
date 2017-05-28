import KRedis from 'Kredis';
import config from 'config';

const cache = new KRedis(config.redis);

export default cache;
