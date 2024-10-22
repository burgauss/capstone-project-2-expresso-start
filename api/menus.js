const express = require('express');
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const menusRouter = express.Router();

menusRouter.get('/', (req, res, next)=>{
    const sql =`SELECT * FROM Menu`;
    db.all(sql, (err, menus) =>{
        if (err){
            const err = new Error('Not possible to get menus');
            return next(err); 
            
        }
        res.status(200).send({menus: menus});

    })
});

menusRouter.post('/', (req, res, next)=>{
    const {title} = req.body.menu;
    if (!title){
        return res.status(400).send();
    }

    const sql =`INSERT INTO Menu (title) VALUES ($title)`;
    const ref = {$title: title};

    db.run(sql, ref, function(err) {
        if (err){
            next(error);
            return;
        }
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
            if (!menu) {
                return next(err);
            }
            res.status(201).send({menu: menu});
            });

    })
});

menusRouter.param('menuId', (req,res,next,id)=>{
    db.get("SELECT * FROM Menu WHERE id = $id", {$id:id}, (err, menu) =>{
        if (err){
            return next(err); // Pass the error to the next middleware (the error handler)
        } 
        if (menu){
            req.menu = menu;
            next();
        } else{
            return res.status(404).send("The menu was not found");
        }
    })
});

menusRouter.get('/:menuId', (req, res, next)=>{
    return res.status(200).send({menu:req.menu});
});

menusRouter.put('/:menuId', (req,res,next)=>{
    //TODO: Undefined menuId!!!
    const {title} = req.body.menu;
    if (!title){
        return res.status(400).send();
    }
    
    const sql = `UPDATE Menu SET title = $title WHERE id=$id`;
    const ref = {$title:title, $id:req.menu.id};
    db.run(sql, ref, function(err) {
        if (err){
            return next(err);
        } 
        db.get(`SELECT * FROM Menu WHERE id = $id`, {$id:req.menu.id}, (err, menu)=>{
            if(err){
                return next(err);
            }
            res.status(200).send({menu:menu});
    })});
});

menusRouter.delete('/:menuId', (req, res, next)=>{
    
    db.get(`SELECT * FROM MenuItem WHERE menu_id = $menuId`, {$menuId:req.menu.id}, (err, menuItem)=>{
        if (err){
            return next(err);
        }
        if (menuItem){
            return res.status(400).send();
        }
        db.run(`DELETE FROM Menu WHERE id = $id`, {$id:req.menu.id}, function(err){
            if(err){
                return next(err);
            }
            res.status(204).send();
        });
    });

});


module.exports = menusRouter;