import log4js from 'log4js';

const appenders = {
  console: {
    type: 'console'
  }
};
const categories = {
  default: {
    appenders: ['console'],
    level: 'info'
  }
};

if (process.env.NODE_ENV === 'development') {
  // categories.default.level = 'debug';
}

log4js.configure({ categories, appenders });

export default log4js;
