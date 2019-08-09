const low = require('lowdb');
const path = require('path');
const { prompt } = require('inquirer');
const FileSync = require('lowdb/adapters/FileSync');
const shortid = require('shortid');

const dbDirectory = path.resolve(__dirname, '../', 'db', 'db.json');

const adapter = new FileSync(dbDirectory);
const db = low(adapter);
db.defaults({ admins: [], customers: [], rentals: {} }).write();
const logger = require('../logger');

const Movie = require('./movie');
const Table = require('./table');

class Customer {
  constructor(user) {
    this.user = user;
    this.db = db;
    this.db.defaults({ admins: [], customers: [], rentals: {} }).write();
  }

  create(user) {
    user.id = shortid.generate();
    this.db
      .get('customers')
      .push(user)
      .write();
    // this.db.write();
  }

  formatRentalFee(fee) {
    return Number(fee).toLocaleString('NG', {
      style: 'currency',
      currency: 'NGN'
    });
  }

  checkName(name) {
    return !!this.db
      .get('customers')
      .find({ name })
      .value();
  }
  checkIfUserExists(user) {
    return this.db
      .get('customers')
      .find({ name: user.name, password: user.password })
      .value();
  }

  logMenu() {
    logger.header('DASHBOARD MENU');
    const choices = [
      'Search Movie',
      'Select Genre',
      'Show Rented Movies',
      'Profile',
      'Quit'
    ];
    return prompt({
      name: 'userSelect',
      type: 'list',
      message: 'Choose an option',
      choices
    }).then(answer => {
      const select = answer.userSelect.toLowerCase();
      const actions = {
        'select genre': this.selectGenre,
        'show rented movies': this.showRentals,
        'search movie': this.searchMovie,
        profile: this.showProfile,
        quit: () => process.exit(1)
      };
      return actions[select]();
    });
  }

  selectGenre = () => {
    logger.header('Movie Genres List');
    const choices = Movie.showGenres().map(movie => ({
      name: movie.name
    }));
    return prompt({
      name: 'genre',
      message: 'Select Movie Genre',
      type: 'list',
      choices
    }).then(answer => {
      logger.clear();
      logger.log('SELECT MOVIES FOR RENT');
      const movies = Movie.getMoviesBasedOnGenres(answer.genre);
      Movie.logMovies(movies);
      this.selectMoviesToRent(movies);
    });
  };

  searchMovie = () => {
    logger.header('Search For Movies');
    return prompt({
      type: 'input',
      name: 'title',
      message: 'Enter Title of Movie',
      filter: input => input.trim(),
      validate: input => {
        if (!input) {
          return 'Enter a valid movie title';
        }
        return true;
      }
    }).then(({ title }) => {
      const movies = Movie.searchByTitle(title);
      this.selectMoviesToRent(movies);
    });
  };

  selectMoviesToRent(movies) {
    const choices = movies.map(
      movie => `${movie.title} - ${this.formatRentalFee(movie.dailyRentalFee)}`
    );

    return prompt({
      name: 'movies',
      message: 'Select Movies For Rent',
      type: 'checkbox',
      choices
    }).then(answer => {
      return this.addRental(answer.movies);
    });
  }

  addRental(movies) {
    const regex = /^(.*)-(?:.*)$/;
    if (!movies || movies.length === 0) {
      logger.error('No Movie was selected');
      return this.goBackToMenu();
    }
    for (let movie of movies) {
      const [_, title] = regex.exec(movie);
      const id = Movie.findByTitle(title.trim());
      this.createRental(id);
    }
    logger.success(`${movies.length} movie(s) was added to Rentals`);
    return this.goBackToMenu();
  }

  createRental(id) {
    const rentals = this.db.get('rentals');
    const rental = {
      id,
      dateOut: Date.now(),
      rentalDuration: '7 Days'
    };
    const userId = this.user.id;
    if (!rentals.get(userId).value()) {
      rentals.set(userId, []).write();
    }
    const existingRental = rentals
      .get(userId)
      .find({ id })
      .value();
    if (existingRental) return;
    rentals
      .get(userId)
      .push(rental)
      .write();
  }

  showProfile = () => {
    logger.header('Profile Details');
    const { name, email, account_no } = this.user;
    Table(['Name', 'Email', 'Account No'], [[name, email, account_no]]);
    this.goBackToMenu();
  };

  showRentals = () => {
    logger.header('Rented Movies List');
    let rentals = this.db
      .get('rentals')
      .get(this.user.id)
      .value();

    if (rentals) {
      const userRentals = rentals
        .map(rental => {
          const movie = Movie.findById(rental.id);
          return {
            title: movie.title,
            dateOut: new Date(rental.dateOut).toLocaleDateString(),
            rentalDuration: rental.rentalDuration,
            dailyRentalFee: this.formatRentalFee(movie.dailyRentalFee)
          };
        })
        .map(rental => Object.values(rental));
      Table(
        ['Title', 'Date Rented', 'Rent Duration', 'Daily Rental Fee'],
        userRentals
      );
      this.goBackToMenu();
    } else {
      logger.error('Movie Rentals is currently Empty');
      this.goBackToMenu();
    }
  };

  goBackToMenu() {
    return prompt({
      type: 'confirm',
      name: 'confirm',
      message: 'Go Back to Main Menu',
      default: false
    }).then(answer => {
      if (answer.confirm) {
        this.logMenu();
      }
    });
  }
}

module.exports = Customer;

// const controller = new CustomerController({
//   name: 'somto',
//   email: 'ezechinnaemake@gmail.com',
//   account_no: '1234345',
//   password: '12345',
//   id: 'xsG5Tl6Km'
// });

// controller.showRentals();
