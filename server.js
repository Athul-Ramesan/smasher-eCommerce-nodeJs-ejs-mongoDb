const express = require('express');
const app = express();
const env = require('dotenv')
const path = require('path');
const { urlencoded } = require('body-parser');
const dbConnect = require('./config/dbConnect')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const session = require("express-session")
const flash = require('express-flash');
const nocache = require('nocache');
const logger = require('morgan')
require('./services/cron')

/// env variable or constants
env.config();

/// database connection

dbConnect()

app.use(logger("dev"));
// app.use(express.json());
app.use(urlencoded({ extended: true }))
app.use(express.json());

app.use(express.static('public'))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } //1 hr
}));
app.use(nocache())

app.use(flash())


app.use('/', userRouter)
app.use('/admin', adminRouter);

app.use((req, res) => {
  res.status(404).render("user/404");
});


// app.use((err, req, res, next) => {
//   console.error(err.message);
//   res.status(err.status || 500).send({ status: err.status || 500, message: err.message });
// });


app.listen(process.env.PORT, () => {
  console.log(`server is connected On ${process.env.PORT}`);
})
