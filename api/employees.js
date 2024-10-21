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
    next();
}

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


module.exports = employeesRouter;