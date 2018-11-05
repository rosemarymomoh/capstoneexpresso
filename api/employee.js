const express = require('express');
const employeeRouter = express.Router();
const timeSheetRouter = require ('./timesheet.js')

employeeRouter.use('/:employeeId/timesheets', timeSheetRouter);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE id = $employeeId`, {
    $employeeId:employeeId
  }, (error, row)=> {
    if(error){
      next(error);
    }else if(row){
      req.employee = row;
      next();
    }else{
      res.sendStatus(404);
    }
  });
});


employeeRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE Employee.is_current_employee = 1`, (err, rows) => {
    if(err){
      next(err);
    } else{
      res.status(200).json({employees: rows });
      next();
    }
  });

});

employeeRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

employeeRouter.post('/', (req, res, next) => {
  const employeeToAdd = req.body.employee;

  const name = employeeToAdd.name,
        position = employeeToAdd.position,
        wage = employeeToAdd.wage
        isCurrentEmployee = (employeeToAdd.is_current_employee === 0) ? 0 : 1;

  if (!name || !position || !wage || !isCurrentEmployee){
    res.sendStatus(400);
  }

  const sql = `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES($name, $position, $wage, $isCurrentEmployee)`;
  const values = {
    $name : name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };

  db.run(sql, values, function(error){
    if(error){
      next(error);
    }else{
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, row) => {
        res.status(201).json({employee: row});
      });
    }
  });

});


employeeRouter.put('/:employeeId', (req, res, next) => {

  const employeeToUpdate = req.body.employee;

  const name = employeeToUpdate.name,
        position = employeeToUpdate.position,
        wage = employeeToUpdate.wage
        isCurrentEmployee = (employeeToUpdate.is_current_employee === 0) ? 0 : 1;

    if (!name || !position || !wage || !isCurrentEmployee){
      res.sendStatus(400);
    }


  const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $employeeId';
  const values = {
    $name : name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, function(error){
    if(error){
      next(error);
    }else{
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (error, row) => {
        res.status(200).json({employee: row});
      });
    }
  });
});

employeeRouter.delete('/:employeeId', (req, res, next) => {


const sql = `UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId`;

const values = {
  $employeeId: req.params.employeeId
};

db.run(sql, values, function(error){
  if(error){
    next(error);
  }else{
    db.get(`SELECT *  FROM Employee WHERE id = ${req.params.employeeId}`, (error, row) => {
        res.status(200).json({employee : row});
    });

  }
});

});


module.exports = employeeRouter;
