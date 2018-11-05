const express = require('express');
const timeSheetRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timeSheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (error, row) => {
    if(error){
      next(error);
    }else if(row){
      req.timesheet = row;
      next();
    }else{
      res.sendStatus(404);
    }
  });
});


timeSheetRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, rows) => {
    if(err){
      next(err);
    } else{
      res.status(200).json({timesheets: rows });
      next();
    }
  });

});


timeSheetRouter.post('/', (req,res, next) => {
  const timesheetToAdd = req.body.timesheet;

  const hours = timesheetToAdd.hours,
        rate = timesheetToAdd.rate,
        date = timesheetToAdd.date,
        employeeId = req.params.employeeId;

  if(!timesheetToAdd || !hours || !rate || !date || !employeeId ){
    res.sendStatus(400);
  }

  const sql = `INSERT INTO Timesheet(hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`;

  const values = {
     $hours: hours,
     $rate: rate,
     $date: date,
     $employeeId: employeeId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
        (error, timesheet) => {
          res.status(201).json({timesheet: timesheet});
        });
    }
  });

});

timeSheetRouter.put('/:timesheetId', (req,res, next) => {
  const timesheetToUpdate = req.body.timesheet;

  const hours = timesheetToUpdate.hours,
        rate = timesheetToUpdate.rate,
        date = timesheetToUpdate.date;
        employeeId = req.params.employeeId;

  if(!timesheetToUpdate || !hours || !rate || !date || !employeeId ){
    res.sendStatus(400);
  }

  const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId`;
  const values = {
     $hours: hours,
     $rate: rate,
     $date: date,
     $employeeId: employeeId
  };

  db.run(sql, values, function(error) {
   if (error) {
     next(error);
   } else {
         res.status(200).json({timesheet:req.timesheet});
       }
  });


 });


timeSheetRouter.delete('/:timesheetId', (req, res, next) => {
   const sql = `DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`;

       db.run(sql, function(error){
         if(error){
           next(error);
         }else{
           res.sendStatus(204);
         }
       });
     });

module.exports = timeSheetRouter;
