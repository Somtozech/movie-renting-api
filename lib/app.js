const { movieRentingApi } = require('./api');

const application = {};

async function handleCustomerActions() {
  movieRentingApi.logCustomerMenu();
}

function handleAdminActions() {}

async function handleAuthentication(user) {
  const successfulAuthentication = await movieRentingApi.authenticateUser(user);

  const actions = {
    customer: successfulAuthentication
      ? handleCustomerActions
      : movieRentingApi.showCustomerLogin,
    admin: successfulAuthentication
      ? handleAdminActions
      : movieRentingApi.showAdminLogin
  };
  return actions[user]();
}

async function start() {
  const actions = {
    customer: handleCustomerActions,
    admin: handleAdminActions,
    quit: function() {
      process.exit(1);
    }
  };
  movieRentingApi.logWelcomeMessage();
  const option = await movieRentingApi.getAccountType();
  if (option === 'quit') {
    actions.quit();
  }
  handleAuthentication(option);
  // await handleAuthentication(option);
}

application.start = start;

module.exports = application;
