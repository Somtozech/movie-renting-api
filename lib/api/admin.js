const low = require('lowdb');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');
const shortid = require('shortid');

const dbDirectory = path.resolve(__dirname, '../', 'db', 'db.json');

const adapter = new FileSync(dbDirectory);
const db = low(adapter);
db.defaults({ admins: [], customers: [], rentals: {} }).write();

class Admin {
  constructor(db) {
    this.db = db;
    this.db.defaults({ admins: [], customers: {} }).write();
  }

  create(user) {
    user.id = shortid.generate();
    this.db
      .get('admins')
      .push(user)
      .write();
    return this.db
      .get('admins')
      .find({ id: user.id })
      .value();
    // this.db.write();
  }

  checkIfUserExists(user) {
    return !!this.db
      .get('admins')
      .find({ id: user.id })
      .value();
  }
}

module.exports = new Admin(db);

const controller = new Admin(db);
