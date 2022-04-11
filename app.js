// All codes related to express are here

const express = require('express');
const rateLimit = require('express-rate-limit');
const pug = require('pug');
const path = require('path');
const bookingRoutes = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);

const reviewRoutes = require(`${__dirname}/routes/reviewRoutes`);
const viewRouter = require('./routes/viewRoutes');

const app = express();
const morgan = require('morgan');
const { default: helmet } = require('helmet');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const { dirname } = require('path');

const compression = require('compression');
const cors = require('cors');
// const { path } = require('express/lib/application');

// 1. Middlewares

// IMplementing cors

app.enable('trust proxy');
app.use(cors());
// Access-Control-Allow-Origin *

app.options('*', cors());
// serving static files
app.use(express.static(`${__dirname}/public`));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// a) Set security http headers

//Use helmet to protect HTTP Header
// app.use(helmet()); // This is what we have for now

//Add the following
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://api.tiles.mapbox.com/',
  'https://api.mapbox.com/',
  'https://js.stripe.com',
];
const styleSrcUrls = [
  'https://api.mapbox.com/',
  'https://api.tiles.mapbox.com/',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://api.mapbox.com/',
  'https://a.tiles.mapbox.com/',
  'https://b.tiles.mapbox.com/',
  'https://events.mapbox.com/',
  'https://api.stripe.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ['https://js.stripe.com', 'https://hooks.stripe.com'],
    },
  })
);

// b) Development logging

// How we run different codes whether we are in development or in produciton
if (process.env.NODE_ENV === 'development') {
  // Morgan is a request logger
  app.use(morgan('dev'));
}
// Global Middlewares

// c) Limit requests from same ip
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', apiLimiter);

// d) Body parser: Reading data from body into req.body

app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' })); // Using Middleware here so that req.data can be read

// e) DAta Sanitization against NO-SQL query injection
app.use(ExpressMongoSanitize());

// f) Data sanitization against XSS (Cross site scripting)

app.use(xss());

// g) Prevent parameter pollution (hpp)
app.use(
  hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity'],
  })
);

app.use(compression());

// h) Normal middleware
// app.use((req, _, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.requestTime);
//   // console.log('line 24', req.headers);
//   // console.log(req.cookies);

//   next();
// });
// 3. ROute
app.use('/', viewRouter);
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRoutes);
app.use(`/api/v1/booking`, bookingRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);
//   4. Start Server

module.exports = app;
