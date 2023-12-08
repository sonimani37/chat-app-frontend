importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js");
firebase.initializeApp({
    apiKey: "AIzaSyAY5_vlLDJT-VTpmEs5qHtAuN9tnJGXsoc",
    authDomain: "conversa-connect.firebaseapp.com",
    projectId: "conversa-connect",
    storageBucket: "conversa-connect.appspot.com",
    messagingSenderId: "407063494215",
    appId: "1:407063494215:web:752aa6feebb71c3d277b62",
    measurementId: "G-3JDCL55L1G"
});
const messaging = firebase.messaging();