const express = require('express');
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = express.Router({mergeParams: true});


menuItemsRouter.get('/', (req, res, next)=>{
    sql = `SELECT * FROM MenuItem WHERE menu_id=$menuId`;
    ref = {$menuId:req.params.menuId};

    db.all(sql, ref, (err, menuItems)=>{
        if(err){
            return next(err);
        }
        res.status(200).send({menuItems:menuItems});
    });
});

menuItemsRouter.post('/', (req, res, next)=>{
    const {name, description, inventory, price} = req.body.menuItem;

    if (!name || !description || !inventory || !price){
        return res.status(400).send();
    }

    const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) 
    VALUES ($name, $description, $inventory, $price, $menuId)`;
    const ref = {$name:name, $description:description, $inventory:inventory, $price:price, $menuId:req.params.menuId};
    db.run(sql, ref, function(err){
        if (err) {
            return next(err);
        }
        db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) =>{
            if (!menuItem){
                return res.sendStatus(500);
            }
            res.status(201).send({menuItem: menuItem});
        })
    
    })
})

menuItemsRouter.put('/:menuItemId', (req, res, next)=>{
    const {name, description, inventory, price} = req.body.menuItem;

    if (!name || !description || !inventory || !price){
        return res.status(400).send();
    }

    db.get(`SELECT * FROM MenuItem WHERE menu_id=$menuId`,{$menuId:req.params.menuId}, (err, menuItem)=>{
        //TODO
    });

})


module.exports = menuItemsRouter;
