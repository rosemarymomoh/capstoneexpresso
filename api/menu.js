const express = require('express');
const menuRouter = express.Router();

const menuItemRouter = require('./menuitem.js');

menuRouter.use('/:menuId/menu-items', menuItemRouter);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.param('menuId', (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (error, menu) => {
    if(error){
      next(error);
    }else if(menu){
      req.menu = menu;
      next();
    }else{
      res.sendStatus(404);
    }
  });
});

menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, rows) => {
    if(err){
      next(err);
    } else{
      res.status(200).json({menus: rows });
      next();
    }
  });

});

menuRouter.post('/', (req, res, next) => {
  const menuToAdd = req.body.menu;

  const title = menuToAdd.title;

  if(!menuToAdd || !title){
    res.sendStatus(400);
  }

  const sql = `INSERT INTO Menu(title) VALUES ($title)`;

  const values = {
     $title : title
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
});

});

menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});



menuRouter.put('/:menuId', (req,res, next) => {
  const menuToUpdate = req.body.menu;

  const title = menuToUpdate.title;

  if(!menuToUpdate || !title){
    res.sendStatus(400);
  }

  const sql = `UPDATE Menu SET title = $title`;
  const values = {
     $title: title
  };

  db.run(sql, values, function(error) {
   if (error) {
     next(error);
   } else {
         db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`,
               (error, menu) => {
                 res.status(200).json({menu: menu});
               });
       }
  });

 });


menuRouter.delete('/:menuId', (req, res, next) => {
   const getSQL = `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`;
   const sql = `DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`;
   db.get(getSQL, (error, row) => {
     if(error){
       next(error);
     }else if(row){
       res.sendStatus(400);
     }else{
       db.run(sql, function(error){
         if(error){
           next(error);
         }else{
           res.sendStatus(204);
         }
       });
    }
  });

});

module.exports = menuRouter;
