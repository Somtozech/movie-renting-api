const User = require('./user');

class Customer extends User {
  constructor(user) {
    super(user.name, user.password);
  }
}
