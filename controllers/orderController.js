"use strict";
const { db } = require("../db");
var moment = require("moment"); // JS time module (run npm install moment in this project in order to make it work).
const {
  sendMailToWaitlistCustomer,
  sendMailController,
} = require("./mailController");
const { getCustomerFromDB } = require("./customerController");

/**
 * Creates a new order in the Orders collection.
 * the new order is set by barber and costumer ID's, scedualed date and hour.
 * throughout this function, it uses the 'checkIfOrderExists' helper.
 */
const newOrder = async (req, res, next) => {
  const _chosenBarber = req.body.barberId;
  const _selectedDate = req.body.orderDate;
  const _hour = req.body.orderHour;
  try {
    if (await checkIfOrderExists(_chosenBarber, _selectedDate, _hour)) {
      alert("You have already made this appointments");
      res.send(false);
    } else {
      await db
        .collection("Orders")
        .add({
          barberId: _chosenBarber,
          customerId: req.body.customerId,
          orderDate: _selectedDate,
          orderHour: _hour,
          extra_info: "",
          customerName: req.body.customerName,
          barberName: req.body.barberName,
        })
        .then((docSnapshot) => {
          res.send(JSON.stringify(docSnapshot.id));
        });
    }
  } catch (e) {
    console.log(`Error adding document: ${e}`);
    res.send(false);
  }
};

const getBarberOrders = async (req, res, next) => {
  const uid = req.params.id;
  let orders = {};
  await db
    .collection("Orders")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        const isActive =
          documentSnapshot.data().orderDate >=
          moment(new Date()).format("YYYY-MM-DD");
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
  await db
    .collection("Orders")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        const isActive =
          documentSnapshot.data().orderDate >=
          moment(new Date()).format("YYYY-MM-DD");
        const isUsersOrder = documentSnapshot.data().customerId === uid;
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
 * function for returning the
 * @param {*} uid
 * @returns
 */
const getBarber = async (uid) => {
  const userData = await db
    .collection("Barbers")
    .doc(uid)
    .get()
    .catch((err) => {
      throw Error(err);
    });
  return userData.data();
};

/**
 * function for getting the available appointments -> so you wont set two appointments on the same day.
 * It's using the getBarber helper, which returns the barbers details.
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
        const onDate = documentSnapshot.data().orderDate === date;
        const isBarbers = documentSnapshot.data().barberId === barberId;
        if (onDate && isBarbers) {
          unAvailableOrders.push(documentSnapshot.data().orderHour);
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

const sendDeleted = async (orderId) => {
  let order = await db.collection('Orders').doc(orderId).get();
  order = order.data();
  console.log(156, order);
  const barberId = order.barberId;
  const customerId = order.customerId;
  let barberEmail = await db.collection('Barbers').doc(barberId).get();
  barberEmail = barberEmail.data().userEmail;
  let customerEmail = await db.collection('Customers').doc(customerId).get();
  customerEmail = customerEmail.data().userEmail; 
  const customerBody = {
    email: customerEmail,
    body: `Hi!, your appointment on ${order.orderDate} at ${order.orderHour} has been canceled.`
  }
  const barberBody = {
    email: barberEmail,
    body: `Hi!, an appointment with ${customerEmail} on ${order.orderDate} at ${order.orderHour} has been canceled.`,
  };
  await sendMailController(customerBody);
  await sendMailController(barberBody);

} 

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
    await deleteFromWaitlist(key);
    await sendDeleted(key);
    await db
      .collection("Orders")
      .doc(key)
      .delete()
      .then(() => {
        //await sendDeleted(key);
        res.send("Order deleted!");
      })
      .catch((err) => res.send("Delete Order not finished!, error:", err.message));
  }
};


const deleteFromWaitlist = async (orderId) => {
  await db.collection("WaitList").doc(orderId).delete().catch(err=>{console.log(err.message)});
}
/**
 * This is a inner helper function for 'newOrder' function. it's goes to the DB and search if an order is exists by:
 * @param {*} _chosenBarber - the barber ID's as he appears on Firestore.
 * @param {*} _selectedDate - the date selected on 'YYYY-MM-DD' format.
 * @param {*} _hour - order hour, by 'mm:ss' format.
 * @returns true if it already exists, false otherwise.
 */
const checkIfOrderExists = async (_chosenBarber, _selectedDate, _hour) => {
  let exists = false;
  await db
    .collection("Orders")
    .get()
    .then((querySnapshot) => {
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
      console.log(`EROR: ${err}`);
      alert(err);
    });
  return exists;
};

const addOrderToWaitlist = async (req, res, next) => {
  await db
    .collection("WaitList")
    .doc(req.body.orderId)
    .set({ orderId: req.body.orderId })
    .catch((err) => {
      res.status(400).send(err.message);
    });  
  res.send("Success");
};

const getOrder = async (orderId) => {
  const order = await db.collection("Orders").doc(orderId).get();
  return order.data();
};

const findWaitlistOrderOnDelete = async (req, res) => {
  console.log("here 218");
  const newOrderId = req.params.id;
  const order = await getOrder(newOrderId);
  console.log(order);
  const date = order.orderDate;
  const time = order.orderHour;
  const today = moment(new Date()).format("YYYY-MM-DD");
  const now = moment().format("HH:mm");
  await db
    .collection("WaitList")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach(async (documentSnapshot) => {
        const docOrder = await getOrder(documentSnapshot.data().orderId);
        if (docOrder && docOrder.barberId === order.barberId) {
          const waitListCandidate = docOrder;
          const orderDate = waitListCandidate.orderDate;
          const orderTime = waitListCandidate.orderHour;
          const customer = await getCustomerFromDB(
            waitListCandidate.customerId
          );
          const name = customer.userName;
          const email = customer.userEmail;
          if (orderDate <= today && orderTime <= now) {
            documentSnapshot.delete();
          } else if ((date < orderDate) || (date <= orderDate && time < orderTime)) {
            await sendMailToWaitlistCustomer(
              documentSnapshot.data().orderId,
              newOrderId,
              email,
              name,
              date,
              time
            );
          }
        }
      });
      res.send("Success!");
    })
    .catch((err) => {
      res.status(400).send(err.message);
    });
};

const updateAppointment = async (req, res) => {
  const oldOrderId = req.params.oldOrder;
  const newDate = req.params.date;
  const newTime = req.params.time;
  await db
    .collection("Orders")
    .doc(oldOrderId)
    .update({
      orderDate: newDate,
      orderHour: newTime,
    })
    .catch((err) => {
      res.status(400).send(err.message);
    });
  await deleteFromWaitlist(oldOrderId);
  res.send("You have successfully updated your appointment!");
};

module.exports = {
  newOrder,
  getBarberOrders,
  getCustomerOrders,
  getAvailableAppointments,
  deleteOrder,
  checkIfOrderExists,
  addOrderToWaitlist,
  getOrder,
  findWaitlistOrderOnDelete,
  updateAppointment,
};
