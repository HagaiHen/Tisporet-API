'use strict';
const db = require('../db')

/**
 * Creates a new order in the Orders collection.
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
    const uid = req.params.uid;
    let orders = {};
    await db.collection("Orders")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((documentSnapshot) => {
          const isActive =
            documentSnapshot.data().date >=
            moment(new Date()).format("YYYY-MM-DD");
          const isUsersOrder = documentSnapshot.data().Barber_id === uid;
          if (isActive && isUsersOrder) {
            orders[documentSnapshot.id] = documentSnapshot.data();
          }
        });
      })
      .catch((err) => {
        alert(`error while retriving from database: ${err}`);
      });
    res.send('Barbers oreder sent succsesfuly');
    return orders;
};


/**
 * Returns all customer orders that are valid
 * @param {} uid
 * @returns
 */
const getCustomerOrders = async (req, res, next) => {
  const uid = req.params.uid;
  let orders = {};
  await db
    .collection("Orders")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        const isActive =
          documentSnapshot.data().date >=
          moment(new Date()).format("YYYY-MM-DD");
        const isUsersOrder = documentSnapshot.data().Customer_id === uid;
        if (isActive && isUsersOrder) {
          orders[documentSnapshot.id] = documentSnapshot.data();
        }
      });
    })
    .catch((err) => {
      alert(`error while retriving from database: ${err}`);
    });
  res.send(orders)
};

const getAvailableAppointments = async (req, res, next) => {
  const date = req.params.date;
  const barberId = req.params.barberId;
  const unAvailableOrders = [];
  await firestore()
    .collection("Orders")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        const onDate = documentSnapshot.data().date === date;
        const isBarbers = documentSnapshot.data().Barber_id === barberId;
        if (onDate && isBarbers) {
          unAvailableOrders.push(documentSnapshot.data().time);
        }
      });
    })
    .catch((err) => alert(err));
  const availableHours = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const day = days[new Date(date).getDay()];
  const barber = await getBarber(barberId).catch((err) => {
    alert(err);
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

const deleteOrder = async (req, res, next) => {
  const date = req.params.date;
  const barberId = req.params.barberId;
  const time = req.params.time;
  const key = req.params.key;
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

const checkIfOrderExists = async (_chosenBarber, _selectedDate, _hour) => {
  // const date = req.params.date;
  // const barberId = req.params.barberId;
  // const time = req.params.time;
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