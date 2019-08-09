const chalk = require('chalk');

class Logger {
  log(message) {
    console.log(message);
  }

  clear() {
    console.clear();
  }

  header(message) {
    console.clear();
    console.log(' '.padStart(20, ' '), chalk.blue.bold(message), '\n');
    // logger.log('');
  }

  error(message) {
    console.log(chalk.red(message));
  }

  success(message) {
    console.log(chalk.green(message));
  }
}

module.exports = new Logger();
