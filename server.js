require('dotenv').config({ path: '.env' });
const colors = require('colors');
const DBConnect = require('./src/helpers/dbConnect');

process.on('uncaughtException', (error) => {
  // using uncaughtException event
  // console.log(' uncaught Exception => shutting down..... ');
  console.log(error.name, error.message);
  process.exit(1); //  emidiatly exists all from all the requests
});
const app = require('./app');
// database connection
DBConnect();
// server
const port = process.env.PORT || 7000;
const server = app.listen(port, () => {
  console.log(colors.yellow.bold(`App is running on port ${port}`));
});

// e.g database connection
process.on('unhandledRejection', (error) => {
  // it uses unhandledRejection event
  // using unhandledRejection event
  console.log(' Unhandled Rejection => shutting down..... ');
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1); //  emidiatly exists all from all the requests sending OR pending
  });
});
