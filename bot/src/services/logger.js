import log4js from 'log4js';
import fs from 'fs';

const pathToFile = `${process.cwd()}/logs`;

if (!fs.existsSync(pathToFile)) {
  fs.mkdirSync(pathToFile);
}
const appenders = {
  file: {
    type: 'file',
    filename: `${process.cwd()}/logs/${process.env.NODE_ENV}-app.log`,
    timezoneOffset: 0
  }
};
const categories = {
  default: { appenders: ['file'], level: 'info' }
};

if (process.env.NODE_ENV !== '') {
  // production
  appenders.console = { type: 'console' };
  categories.default.appenders.push('console');
  categories.default.level = 'debug';
}

log4js.configure({ categories, appenders });

export default log4js;
