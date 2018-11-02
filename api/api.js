const express = require('express');

//instance of an express router
const apiRouter = express.Router();
const employeeRouter = require('./employee.js');

apiRouter.use('/employee', employeeRouter);




module.exports = apiRouter;
