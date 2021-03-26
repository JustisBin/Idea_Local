let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let dotenv = require('dotenv')
let nodemailer = require('nodemailer');
let mysql = require('mysql')
let crypto = require('crypto')
let session = require('express-session')
let MySQLStore = require('express-mysql-session')(session);
dotenv.config({
  path: './process.env'
});

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let membersRouter = require('./routes/members');


let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_USE,
  multipleStatements: true
});

// 메일전송 연결
let smtpTransport = nodemailer.createTransport({
  service: process.env.SERVICE_NAME,
  auth: {
    user: process.env.STMP_USER,
    pass: process.env.STMP_PW
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 세션 저장 연결
let options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PW,		//데이터베이스 접근 비밀번호
  database: process.env.DB_USE		//데이터베이스의 이름
};

// 세션 사용 설정

let sessionStore = new MySQLStore(options);
connection.connect();
let app = express();

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/members', membersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;