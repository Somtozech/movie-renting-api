const low = require('lowdb');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');
const Table = require('./table');

const logger = require('../logger');

const movieDirectory = path.resolve(__dirname, '../', 'db', 'movies.json');

const adapter = new FileSync(movieDirectory);
const db = low(adapter);

db.defaults({ movies: [], genres: [] });

class Movie {
  showGenres() {
    return db.get('genres').value();
  }
  getMoviesBasedOnGenres(genre) {
    const movies = db.get('movies').value();
    const moviesBasedOnGenre = movies.filter(o => o.genres.includes(genre));

    return moviesBasedOnGenre;
  }

  logMovies(movies) {
    logger.header('Movie List');
    movies = movies
      .map(movie => ({
        title: movie.title.trim(),
        genres: movie.genres.join(','),
        rating: movie.vote_average,
        release_date: movie.release_date
      }))
      .map(movie => Object.values(movie));
    Table(['Title', 'Genre', 'Rating', 'Release Date'], movies);
    //
  }

  findByTitle(title) {
    const movie = db
      .get('movies')
      .find({ title })
      .value();
    return movie.id;
  }

  findById(id) {
    return db
      .get('movies')
      .find({ id })
      .value();
  }

  searchByTitle(title) {
    const regex = new RegExp(title, 'i');
    const movies = db.get('movies').value();
    const filterMovies = movies.filter(movie => {
      return regex.test(movie.title.toLowerCase());
    });
    this.logMovies(filterMovies);
    return filterMovies;
  }
}

module.exports = new Movie();
