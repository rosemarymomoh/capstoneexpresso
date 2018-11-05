const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorhandler = require('errorhandler');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

//bodyParsing Middleware
app.use(bodyParser.json());

// Logging Middleware
app.use(morgan('dev'));


//Development error-handling/debugging.
app.use(errorhandler());
app.use(cors());


const apiRouter = require('./api/api');
app.use('/api', apiRouter);


app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
});

module.exports = app;
