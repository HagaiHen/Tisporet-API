'use strict';
const db = require('../db')


const newUser = async (req, res, next) => {
    try {
        const data = req.body;
        console.log(data);
        await db.collection("Users")
        .doc(data.userId)
        .set(data);
        res.send('User added successfully');
    } catch(error){
        res.status(400).send(` customer 14 ${error.message}`);

    }}
        

/**
 * function for retreiveing user from the DB, by the user ID.
 * @param {*} uid
 * @returns
 */
const getUser = async (req, res, next) => {
    const uid = req.params.id
    try{
        const userData = await db
            .collection("Users")
            .doc(uid)
            .get(); 
        res.send(userData.data())
    } catch (error){
        res.status(400).send(`customer 33 ${error.message}`);
    }
    
};

module.exports ={
    newUser,
    getUser
}