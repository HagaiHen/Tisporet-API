'use strict';
const db = require('../db')
var moment = require('moment') // JS time module (run npm install moment in this project in order to make it work). 

/**
 * Creates a new order in the Orders collection.
 * the new order is set by barber and costumer ID's, scedualed date and hour.
 * throughout this function, it uses the 'checkIfOrderExists' helper.
 */
const newOrder = async (req, res, next) => {
  const _chosenBarber = req.body.barberId 
  const _selectedDate = req.body.orderDate
  const _hour = req.body.orderHour
  try {
      if (await checkIfOrderExists(_chosenBarber, _selectedDate, _hour)) {
        alert("You have already made this appointments");
        res.send(false)
      } else {
        await db.collection("Orders").add({
            barberId: _chosenBarber,
            Customer_id: req.body.userId,
            date: _selectedDate,
            time: _hour,
            extra_info: "",
            cus_name: req.body.costumerName,
            barber_name: req.body.barberName
            })
            .then(() => {
              res.send(true);
            });
      }
  }catch (e) {
    console.log(`Error adding document: ${e}`)
    res.send(false);
  }
};

const getBarberOrders = async (req, res, next) => {
    const uid = req.params.id;
    let orders = {};
    await db.collection("Orders").get().then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        const isActive = documentSnapshot.data().date >= moment(new Date()).format("YYYY-MM-DD");
        const isUsersOrder = documentSnapshot.data().barberId === uid;        
        if (isActive && isUsersOrder) {
          orders[documentSnapshot.id] = documentSnapshot.data();
        }
      });
      })
      .catch((err) => {
        res.status(400).send(err.message);
      });
    res.send(orders); 
};

/**
 * Returns all customer orders that are valid. the search in firestore is filtered by the current date (using moment module) and
 * the customers ID given in the request.
 * return in the orders list in success (it can be empty in case there is no orders scedualed),
 * and in case of failure, it return the error code.
 */
const getCustomerOrders = async (req, res, next) => {
  const uid = req.params.id;
    let orders = {};
    await db.collection("Orders").get().then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        const isActive = documentSnapshot.data().date >= moment(new Date()).format("YYYY-MM-DD");
        const isUsersOrder = documentSnapshot.data().Customer_id === uid;      
        if (isActive && isUsersOrder) {
          orders[documentSnapshot.id] = documentSnapshot.data();
        }
      });
      })
      .catch((err) => {
        res.status(400).send(err.message);
      });
    res.send(orders); 
};


/**
 * NEED TO BE TESTED WITH GETBARBER FUNCTION
 */
const getAvailableAppointments = async (req, res, next) => {
  const date = req.params.date;
  const barberId = req.params.id;
  const unAvailableOrders = [];
  await db
    .collection("Orders")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        const onDate = documentSnapshot.data().date === date;
        const isBarbers = documentSnapshot.data().BarberId === barberId;
        if (onDate && isBarbers) {
          unAvailableOrders.push(documentSnapshot.data().time);
        }
      });
    })
    .catch((err) => res.status(400).send(err.message));
  const availableHours = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[new Date(date).getDay()];
  const barber = await getBarber(barberId).catch((err) => {
    res.status(400).send(err.message);
  });
  const workingHours = barber.availableWorkHours[day];
  if (workingHours) {
    for (let i = 0; i < workingHours.length; i++) {
      if (!unAvailableOrders.includes(workingHours[i])) {
        availableHours.push(workingHours[i]);
      }
    }
    res.send(availableHours);
  } else {
    res.send([]);
  }
};

/**
 * Function for connecting the DB, and delete an order by the order ID. 
 * Post function, Getting back the error code in case of failure, 'Order Deleted!' as DR in case of success.
 */
const deleteOrder = async (req, res, next) => {
  const date = req.body.date;
  const barberId = req.body.barberId;
  const time = req.body.time;
  const key = req.body.key;
  if (barberId && date && time && key) {
    await db
      .collection("Orders")
      .doc(key)
      .delete()
      .then(() => {
        res.send("Order deleted!");
      })
      .catch((err) => res.send("Delete Order not finished!, error:",err));
  }
};

/**
 * This is a inner helper function for 'newOrder' function. it's goes to the DB and search if an order is exists by:
 * @param {*} _chosenBarber - the barber ID's as he appears on Firestore.
 * @param {*} _selectedDate - the date selected on 'YYYY-MM-DD' format.
 * @param {*} _hour - order hour, by 'mm:ss' format.
 * @returns true if it already exists, false otherwise. 
 */
const checkIfOrderExists = async (_chosenBarber, _selectedDate, _hour) => {
  let exists = false;
  await db.collection("Orders").get().then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        if (
          documentSnapshot.data().Barber_id === _chosenBarber &&
          documentSnapshot.data().date === _selectedDate &&
          documentSnapshot.data().time === _hour
        ) {
          console.log("in Here");
          exists = true;
        }
      });
    })
    .catch((err) => {
      console.log(`EROR: ${err}`)
      alert(err);
    });
    return exists

};

module.exports = {
    newOrder,
    getBarberOrders,
    getCustomerOrders,
    getAvailableAppointments,
    deleteOrder,
    checkIfOrderExists
}