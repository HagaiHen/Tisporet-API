const express = require('express');
const { 
        newOrder,
        getBarberOrders,
        getCustomerOrders,
        getAvailableAppointments,
        deleteOrder
} =  require('../controllers/orderController');

const router = express.Router();



router.post('/order',newOrder);
router.get('/orderByBarber/:id',getBarberOrders);
router.get('/orderCustomer/:id',getCustomerOrders);
router.get('/orderAvailable/:id/:date',getAvailableAppointments);
router.post('/deleteOrder/', deleteOrder)


module.exports = {
    routes: router
}