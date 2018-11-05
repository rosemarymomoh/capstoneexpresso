const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const isValid = (req, res, next) => {
  const Item = req.body.menuItem;

  const name = Item.name;
  const description = Item.description;
  const inventory = Item.inventory;
  const price = Item.price;
  if(!name || !description || !inventory || !price) {
    res.sendStatus(400);
  };
  next();
};


menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get(`SELECT * FROM menuItem WHERE id = ${menuItemId}`, (error, row) => {
    if(error){
      next(error);
    }else if(row){
      req.menuItem = row;
      next();
    }else{
      res.sendStatus(404);
    }
  });
});

menuItemRouter.get('/', (req, res, next) => {

  const menuId = req.params.menuId;
  const sql = `SELECT * FROM MenuItem WHERE menu_id = $menuId`;
  const values = {$menuId: menuId};

  db.all(sql, values, (error, rows) =>{
     if(error){
       next(error);
     }else{
       res.status(200).json({menuItems : rows});
     }
  });

});

menuItemRouter.post('/', isValid, (req, res, next) => {
  const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id)
               VALUES ($name, $description, $inventory, $price, $menuId)`;
  const values = {
                  $name: req.body.menuItem.name,
                  $description: req.body.menuItem.description,
                  $inventory: req.body.menuItem.inventory,
                  $price: req.body.menuItem.price,
                  $menuId: req.params.menuId
                };

  db.run(sql, values, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`,
              (error, menuItem) => {
                if(error){
                  next(error)
                }else{
                  res.status(201).json({menuItem: menuItem});
                }
            });
          };
  });
});

menuItemRouter.put('/:menuItemId', (req,res, next) => {
  const menuItemToUpdate = req.body.menuItem;

  const name = menuItemToUpdate.name,
        description = menuItemToUpdate.description,
        inventory = menuItemToUpdate.inventory,
        price = menuItemToUpdate.price,
        menuId = req.params.menuId;

  if(!menuItemToUpdate || !name|| !inventory || !price || !menuId ){
    res.sendStatus(400);
  }

  const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId`;
  const values = {
     $name:name,
     $description: description,
     $inventory: inventory,
     $price: price,
     $menuId: menuId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`,
        (error, menuItem) => {
          res.status(200).json({menuItem: menuItem});
        });
    }
  });
 });


 menuItemRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = `DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`;
      db.run(sql, function(error){
          if(error){
            next(error);
          }else{
            res.sendStatus(204);
          }
        });
      });

module.exports = menuItemRouter;
