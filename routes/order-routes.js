const express = require('express');
const { 
        newOrder,
        getBarberOrders,
        getCustomerOrders,
        getAvailableAppointments,
        deleteOrder,
        addOrderToWaitlist,
        getOrder,
        findWaitlistOrderOnDelete,
        updateAppointment
} =  require('../controllers/orderController');
const {sendMail} = require('../controllers/mailController');

const router = express.Router();



router.post('/order',newOrder);
router.get('/orderByBarber/:id',getBarberOrders);
router.get('/orderCustomer/:id',getCustomerOrders);
router.get('/availableAppointments/:id/:date',getAvailableAppointments);
router.post('/deleteOrder', deleteOrder)
router.post('/waitlist', addOrderToWaitlist)
router.post('/sendmail',sendMail);
router.get('/order/:id',getOrder);
router.post('/findearlyorder/:id',findWaitlistOrderOnDelete);
router.get('/updateappointment/:oldOrder/:date/:time',updateAppointment);

module.exports = {
    routes: router
}