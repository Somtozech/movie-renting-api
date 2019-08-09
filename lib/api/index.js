const adminController = require('./admin');
const Customer = require('./customer');
const chalk = require('chalk');
const logger = require('../logger');
const { prompt } = require('inquirer');

class MovieRentingApi {
  constructor() {
    this.admin = null;
    this.customer = new Customer();
  }

  logWelcomeMessage() {
    const welcomeMessage = chalk.cyan.bgBlackBright.bold(
      ' MOVIE RENTING',
      chalk.red('API ')
    );
    logger.header(welcomeMessage);
  }

  // get type of account ie user or admin
  getAccountType() {
    // const choices = ['Customer', 'Admin', 'Quit'];
    const choices = ["Customer",'Quit'];
    return prompt({
      name: 'account',
      type: 'list',
      message: 'Sign in as user or admin',
      choices: choices
    }).then(answer => answer.account.toLowerCase());
  }

  authenticateUser(user) {
    logger.header('AUTHENTICATION');
    const choices = ['Login', 'Sign Up'];
    return prompt({
      name: 'method',
      type: 'list',
      message: 'Log in or Sign Up (new Account)',
      choices: choices
    }).then(answer => {
      const method = answer.method.toLowerCase();
      if (method === 'login') {
        return user === 'admin'
          ? this.showAdminLogin()
          : this.showCustomerLogin();
      } else {
        return user === 'admin'
          ? this.showAdminSignup()
          : this.showCustomerSignup();
      }
    });
  }

  showAdminLogin() {}

  showAdminSignup() {
    console.log('Admin Sign Up');
  }

  showCustomerLogin = () => {
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter name',
        filter: function(input) {
          return input.trim();
        },
        validate: input => {
          if (!input) {
            return 'Please enter a valid name';
          }
          if (!this.customer.checkName(input.trim())) {
            return 'Invalid Name';
          }
          this.customer.name = input;
          return true;
        }
      },
      {
        type: 'password',
        name: 'password',
        mask: true,
        message: 'Enter password',
        filter: input => input.trim(),
        validate: input => {
          if (!input || input.length < 4) {
            return 'Password must have a length of 4 or More';
          }
          if (
            !this.customer.checkIfUserExists({
              name: this.customer.name,
              password: input
            })
          ) {
            return 'Invalid Password';
          }
          return true;
        }
      }
    ];

    return prompt(questions).then(answer => {
      const validUser = this.customer.checkIfUserExists(answer);
      if (validUser) {
        this.customer = new Customer(validUser);

        return true;
      }

      logger.error(`Invalid name or password`);
      logger.log('Please Try again!!');
      return false;
    });
  };

  showCustomerSignup() {
    logger.header(chalk.blue.bold('AUTHENTICATION'));
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter name',
        filter: function(input) {
          return input.trim();
        },
        validate: function(input) {
          if (!input) {
            return 'Please enter a valid name';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'email',
        mask: true,
        message: 'Enter email',
        filter: input => input.trim(),
        validate: function(input) {
          if (!/.*@.*/.test(input)) {
            return 'Enter valid email Address';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'account_no',
        message: 'Enter Credit Card No (10 digits only)',
        filter: input => input.trim(),
        validate: function(input) {
          if (!input || input.length !== 10) {
            return 'Enter Valid Credit Card Details';
          }
          return true;
        }
      },
      {
        type: 'password',
        name: 'password',
        mask: true,
        message: 'Enter password',
        filter: input => input.trim(),
        validate: function(input) {
          if (!input || input.length < 4) {
            return 'Password must have a length of 4 or More';
          }
          return true;
        }
      }
    ];

    return prompt(questions).then(answer => {
      this.customer.create(answer);
      const validUser = this.customer.checkIfUserExists(answer);
      if (validUser) {
        this.customer = new Customer(validUser);
        return true;
      }

      return this.showCustomerLogin();
    });
  }

  logCustomerMenu() {
    this.customer.logMenu();
  }
}

const movieRentingApi = new MovieRentingApi();

exports.movieRentingApi = movieRentingApi;

// module.exports = movieRentingApi;
