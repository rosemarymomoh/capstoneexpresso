const express = require('express');

//instance of an express router
const apiRouter = express.Router();
const employeeRouter = require('./employee.js');
const menuRouter = require('./menu.js');
const menuItemRouter = require('./menuitem.js');
const timeSheetRouter = require('./timesheet.js');

apiRouter.use('/employees', employeeRouter);
apiRouter.use('/timesheets', timeSheetRouter);
apiRouter.use('/menus', menuRouter);
apiRouter.use('/menu-items', menuItemRouter);

module.exports = apiRouter;
