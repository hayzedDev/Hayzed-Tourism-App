const dotenv = require('dotenv');

// Handling uncaught exception error (synchronous errors)
process.on('uncaughtException', (err) => {
  console.log('uncaughtException🎆🎆 Shutting down...');
  console.log(err.name, err.message, err);

  process.exit(1);
});

const mongoose = require('mongoose');
if (process.env.NODE_ENV === 'development')
  dotenv.config({ path: `./config.env` });
const app = require(`${__dirname}/app`);

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    //connecting to a hosted database
    // .connect(process.env.DATABASE_LOCAL, {
    //connecting to a local databse on out computer
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // serverApi: ServerApiVersion.v1,
  })
  .then((conn) => {
    console.log('DB connection successful!!');
  });

const port = process.env.PORT || 2000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling unhandled rejection errors
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION🎆🎆 Shutting down...');
  // closing the server, then Shutting down our app
  server.close(() => {
    process.exit(1);
  });
});

// Prevents our server from shutting down intermittently while users are still making requests
process.on('SIGTERM', () => {
  console.log('🎆🎆 SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    console.log('✔️✔️ Process terminated!');
  });
});
