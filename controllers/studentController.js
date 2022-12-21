'use strict';
const db = require('../db')

const addStudent = async (req, res, next) =>{
    try{
        const data = req.body;
        await db.collection('students').doc().set(data);
        res.send('Record saved successfuly');
    }catch(err){
        res.status(400).send(err.message);
    }
}

module.exports = {
    addStudent
}
