const express = require('express');
const {
    newUser,
    getUser  
} = require('../controllers/customerController');

const router = express.Router();

router.post('/user', newUser);//write
router.get('/user/:id', getUser);//read


module.exports = {
    routes: router
}