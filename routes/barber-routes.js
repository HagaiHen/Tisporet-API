const express = require('express');
const { 
        addBarber, 
        updateBarberWorkingDays, 
        getBarberWorkingDays, 
        getBarber,
        getBarberList,
        updateFirstEntry
} =  require('../controllers/barberController');

const router = express.Router();

router.post('/barber',addBarber);//write
router.get('/barber/:id',getBarber);//read
router.get('/barbers',getBarberList)
router.post('/barber/:id/workdays', updateBarberWorkingDays);
router.get('/barber/:id/workdays', getBarberWorkingDays);
router.post('/barber/:id/firstentry',updateFirstEntry);


module.exports = {
    routes: router
}