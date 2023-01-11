const express = require('express');
const { 
        addBarber, 
        updateBarberWorkingDays, 
        getBarberWorkingDays, 
        getBarber,
        getBarberList,
        updateFirstEntry,
        getBarbersData,
        updateBarberAddress
} =  require('../controllers/barberController');

const router = express.Router();

router.post('/barber',addBarber);//write
router.get('/barber/:id',getBarber);//read
router.get('/barbers',getBarberList)
router.post('/barber/:id/workdays', updateBarberWorkingDays);
router.get('/barber/:id/workdays', getBarberWorkingDays);
router.post('/barber/:id/firstentry',updateFirstEntry);
router.get('/barbersdata',getBarbersData);
router.post('/barber/:id/address', updateBarberAddress);


module.exports = {
    routes: router
}