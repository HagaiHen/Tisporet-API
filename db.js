const firebase = require('firebase');
const config = require('./config');
const db = firebase.initializeApp(config.firebaseConfig).firestore();
const auth = firebase.auth();
module.exports = {db,auth};

