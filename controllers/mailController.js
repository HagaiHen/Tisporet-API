"use strict";
const nodemailer = require("nodemailer");

const sendMail = async (req, res, next) => {
  console.log(req.body);
  const payload = req.body;
  const email = payload.email;
  const body = payload.body;
  try {
    await sendMailController({ email, body });
    res.send("Email sent!");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const sendMailToWaitlistCustomer = async (
  waitListOrder,
  newOrder,
  customerEmail,
  customerName,
  orderDate,
  orderTime
) => {
  const payload = {
    email: customerEmail,
    body: `Hello! ${customerName}, we found an earlier appointment for you!\n
          on: ${orderDate}, at: ${orderTime}\n
          if you would like to take this appointment please click this link:`,
    link:
      `<div><h1>Hello! ${customerName},</h1><p>we found an earlier appointment for you!\n
          on: ${orderDate}, at: ${orderTime}\n
         if you would like to take this appointment please click this link: <a href="http://localhost:8080/api/updateappointment/${waitListOrder}/${orderDate}/${orderTime}">Update Here!</a></p></div>`
  };
  await sendMailController(payload);
};

const sendMailController = async (payload) => {
  const email = payload.email;
  const body = payload.body;
  const link = payload.link;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });
  const msg = {
    from: '"TISPORET" <tisporet@noreply.com>', // sender address
    to: `${email}`, // list of receivers
    subject: "Hello", // Subject line
    text: `${body}`, // plain text body
    html: `${link ? link : ""}`,
  };

  await transporter.sendMail(msg);
};

module.exports = { sendMail, sendMailToWaitlistCustomer };

    