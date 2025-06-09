// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseAdminKey.json'); // Make sure the filename matches exactly

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
