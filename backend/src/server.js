const app = require('./app');
const { log } = require('./utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  log('info', `서버가 시작되었습니다`, { port: PORT, env: process.env.NODE_ENV });
});
