const express = require('express');
const sqlite = require('sqlite3');

const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = express.Router({mergeParams: true});

timesheetsRouter.get('/', (req, res, next) => {
    db.all("SELECT * FROM Timesheet WHERE employee_id = $employeeId",{$employeeId: req.params.id}, (err, timesheets) => {
        if(err){
            return next(err);
        } else {
            res.status(200).send({timesheets: timesheets});
        }
})
});

timesheetsRouter.post('/', (req, res, next) => {
    const {hours, rate, date} = req.body.timesheet;
    const employee_id = req.params.id;

    if (!hours || !rate || !date){
        return res.status(400).send();
    }

    db.get(`SELECT * FROM Employee WHERE id =$id`, {$id:employee_id}, (err, employee) => {
        if (err){
            return next(err);
        }
        if (!employee){
            return res.status(400).send();
        }
        const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id) 
        VALUES ($hours, $rate, $date, $employeeId)`;
        const ref = {$hours: hours, $rate:rate, $date:date, $employeeId:employee_id};
        db.run(sql, ref, function(err){
            if (err) {
                return next(err);
            }
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) =>{
                if (!timesheet){
                    return res.sendStatus(500);
                }
                res.status(201).send({timesheet: timesheet});
            })
        
        })
    })


});

timesheetsRouter.param('timesheetId', (req, res, next, id)=>{
    db.get("SELECT * FROM Timesheet WHERE id = $id", {$id:id}, (err, timesheet) =>{
        if (err){
            return next(err); // Pass the error to the next middleware (the error handler)
        } 
        if (timesheet){
            req.timesheet = timesheet;
            next();
        } else{
            return res.status(404).send("The timesheet was not found");
        }
    })
})

timesheetsRouter.put('/:timesheetId', (req, res, next)=>{
    const {hours, rate, date} = req.body.timesheet;
    const employee_id = req.params.id;

    if (!hours || !rate || !date){
        return res.status(400).send();
    }

    const sql = `UPDATE Timesheet SET hours=$hours, rate=$rate, date=$date, employee_id=$employeeId WHERE id=$id`;
    const ref = {$hours: hours, $rate:rate, $date:date, $employeeId:employee_id, $id:req.timesheet.id};

    db.run(sql, ref, function(err){
        if (err){
            next(err);
            return res.status(500).send();
        }
        db.get(`SELECT * FROM Timesheet WHERE id = ${req.timesheet.id}`, (err, timesheet) => {
            if (!timesheet) {
                return res.sendStatus(500);
            }
            res.send({timesheet: timesheet});
            });
    });

});

timesheetsRouter.delete('/:timesheetId', (req, res, next)=>{
    db.run('DELETE FROM Timesheet WHERE id=$id', {$id:req.timesheet.id}, function(err){
        if(err){
            next(err);
            return res.status(500).send();
        }
        res.status(204).send();
    })
});



module.exports = timesheetsRouter;
