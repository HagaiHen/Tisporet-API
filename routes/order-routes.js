const express = require('express');
const { 
        newOrder,
        getBarberOrders,
        getCustomerOrders,
        getAvailableAppointments,
        deleteOrder,
        checkIfOrderExists
} =  require('../controllers/orderController');

const router = express.Router();



router.post('/order',newOrder);
router.get('/order/barber/:id',getBarberOrders);
router.get('/order/customer/:id',getCustomerOrders);
router.get('/order/Available',getAvailableAppointments);


module.exports = {
    routes: router
}