// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAY5_vlLDJT-VTpmEs5qHtAuN9tnJGXsoc",
    authDomain: "conversa-connect.firebaseapp.com",
    projectId: "conversa-connect",
    storageBucket: "conversa-connect.appspot.com",
    messagingSenderId: "407063494215",
    appId: "1:407063494215:web:752aa6feebb71c3d277b62",
    measurementId: "G-3JDCL55L1G",
    vapidKey: "BB81DKObRgnmN6xghCrRlvv3NykQLwgDtX4Av_iJMJPPrf_VChXoTrPk8yjNDS06Qb5qHdvGQ97J5BI_bjq_g5k"
  },
  fcmUrl: 'https://fcm.googleapis.com/fcm/send'
};

export const baseUrl = 'http://localhost:7000/api/';
export const serverUrl = 'http://localhost:7000';
export const imagePath = 'http://localhost:7000';

// export const baseUrl = 'http://103.127.29.85/mangoproject/public/api/'
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
