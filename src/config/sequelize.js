const database = 'mavidurak';
const username = 'root';
const password = 'Vio1996';
const host = 'localhost';
const port = '3306';


module.exports = {
  development: {
    username,
    password,
    database,
    host,
    dialect: 'mysql'
  },
  test: {
    username,
    password,
    database,
    host,
    dialect: 'mysql'
  },
  production: {
    username,
    password,
    database,
    host,
    dialect: 'mysql'
  }
};
