const express = require('express');
const sqlite = require('sqlite3');
const { ModuleFilenameHelpers } = require('webpack');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const employeesRouter = express.Router();

const validateEmployee = (req, res, next) => {
    const {name, position, wage} = req.body.employee;
    if (!name || !position || !wage){
        return res.status(400).send();
    }
    console.log("employee has been validated");
    next();
}

employeesRouter.param('id', (req, res, next, id)=> {
    db.get("SELECT * FROM Employee WHERE id = $id", {$id:id}, (err, employee) =>{
        if (err){
            return next(err); // Pass the error to the next middleware (the error handler)
        } 
        if (employee){
            req.employee = employee;
            next();
        } else{
            return res.status(404).send("The employee was not found");
        }
    })
});

employeesRouter.get('/', (req, res, next) =>{
    const sql =`SELECT * FROM Employee WHERE is_current_employee = 1`;
    db.all(sql, (err, employees) =>{
        if (err){
            const err = new Error('Not possible to get employees');
            next(err); // Pass the error to the next middleware (the error handler)
            return;
        }
        res.status(200).send({employees: employees});

    })
});


employeesRouter.post('/', validateEmployee, (req, res, next) =>{
    const {name, position, wage} = req.body.employee;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1 ;
    const sql =`INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)`;
    const ref = {$name: name, $position:position, $wage: wage, $isCurrentEmployee: isCurrentEmployee};

    db.run(sql, ref, function(err) {
        if (err){
            next(error);
            return;
            // return res.status(500).send();
        }
        db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
            if (!employee) {
                const err = new Error('Not possible to retrieve last created employee');
                next(err); // Pass the error to the next middleware (the error handler)
                return;
            }
            res.status(201).send({employee: employee});
            });

    })
});

employeesRouter.get('/:id', (req, res, next)=> {
    res.send({employee: req.employee});
});

employeesRouter.put('/:id', (req, res, next) => {
    const {name, position, wage} = req.body.employee;
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1 ;
    if (!name || !position || !wage){
        return res.status(400).send();
    }
    
    const sql = `UPDATE Employee SET name = $name, position=$position, wage=$wage, 
    is_current_employee=$isCurrentEmployee  WHERE id=$id`;
    const ref = {$name: name, $position:position, $wage: wage, 
        $isCurrentEmployee:isCurrentEmployee, $id:req.employee.id};
    db.run(sql, ref, function(err) {
        if (err){
            return next(err);
        } 
        db.get(`SELECT * FROM Employee WHERE id = $id`, {$id:req.employee.id}, (err, employee)=>{
            if(err){
                return next(err);
            }
            res.status(200).send({employee:employee});
    })});
});

employeesRouter.delete('/:id', (req, res, next)=>{
    const sql = `UPDATE Employee SET is_current_employee = 0 WHERE id=$id`;
    const ref = {$id:req.employee.id};
    db.run(sql, ref, function(err){
        if (err) {
            return next(err);
        }
        db.get(`SELECT * FROM Employee WHERE id=$id`, {$id:req.employee.id}, (err, employee)=>{
            if (err) {
                return next(err);
            }
            res.status(200).send({employee:employee});

        })
    })
});

module.exports = employeesRouter;