const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

const app = express();
const Test = require('./src/models/Test');
const userRouter = require('./src/routers/userRouter');
const authRouter = require('./src/routers/authRouter');
const projectRouter = require('./src/routers/projectRouter');

const globalErrorHandler = require('./src/middlewares/globalErrorHandler');

const AppError = require('./src/helpers/appError');

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

console.log(process.env.NODE_ENV);
// set security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// $ CORS
app.use(cors());

//  set limit request from same API in timePeroid from same ip
const limiter = rateLimit({
  max: 100, //   max number of limits
  windowMs: 60 * 60 * 1000, // hour
  message: ' Too many req from this IP , please Try  again in an Hour ! ',
});

app.use('/api', limiter);

//  Body Parser  => reading data from body into req.body protect from scraping etc
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSql query injection
app.use(mongoSanitize()); //   filter out the dollar signs protect from  query injection attact

// Data sanitization against XSS
app.use(xss()); //    protect from molision code coming from html

// routes
app.get("/api/download/:id", async(req,res)=>{
  try {
    const { id } = req.params;
    const test = await Test.findById(id);
    if (!test) {
      return next(new AppError(`No test found against id ${id}`, 404));
    }
    if (test.status == 'pending') {
      return next(new AppError(`Test is not completed yet`, 404));
    }
    const path = `uploads/${id}.pdf`;
    console.log('data');
    res.download(path)
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
})

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter);

// handling all (get,post,update,delete.....) unhandled routes

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
