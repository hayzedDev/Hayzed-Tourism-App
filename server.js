const dotenv = require('dotenv');

// Handling uncaught exception error
process.on('uncaughtException', (err) => {
  console.log('uncaughtException🎆🎆 Shutting down...');
  console.log(err.name, err.message, err);

  process.exit(1);
});

const mongoose = require('mongoose');
// dotenv.config({ path: `./config.env` });
const app = require(`${__dirname}/app`);

const DB = process.env.DATABASE;
// const DB =
// 'mongodb+srv://hayzedDev:jjqlNzUGk7oRbO3u@cluster0.2iedr.mongodb.net/Natours-App?retryWrites=true&w=majority';

// .replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

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

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri =
//   'mongodb+srv://hayzedDev:<password>@cluster0.2iedr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverApi: ServerApiVersion.v1,
// });
// client.connect((err) => {
//   const collection = client.db('test').collection('devices');
//   // perform actions on the collection object
//   client.close();
// });

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
