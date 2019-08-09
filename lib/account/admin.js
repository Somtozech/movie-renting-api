const User = require('./user');

class Admin extends User {
  constructor(name, password) {
    super(name, password);
    this.isAdmin = true;
  }

  uploadMovie(movie) {}
}

module.exports = Admin;
