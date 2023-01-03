'use strict';
const db = require('../db')


const newCustomer = async (req, res, next) => {
    try {
        const data = req.body;
        console.log(data);
        await db.collection("Customers")
        .doc(data.userId)
        .set(data);
        res.send('Customer added successfully');
    } catch(error){
        res.status(400).send(`${error.message}`);

    }}
        

/**
 * function for retreiveing user from the DB, by the user ID.
 * @param {*} uid
 * @returns
 */
const getCustomer = async (req, res, next) => {
    const uid = req.params.id
    try{
        const userData = await db
            .collection("Customers")
            .doc(uid)
            .get(); 
        res.send(userData.data())
    } catch (error){
        res.status(400).send(`${error.message}`);
    }
    
};

module.exports ={
    newCustomer,
    getCustomer
}