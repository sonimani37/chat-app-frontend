// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
	production: false,
	firebase: {
		apiKey: "AIzaSyBJkXXNgvFJtbjHaTFNLJlh0Grjw9gJa34",
		authDomain: "conversaconnect.firebaseapp.com",
		projectId: "conversaconnect",
		storageBucket: "conversaconnect.appspot.com",
		messagingSenderId: "87733983711",
		appId: "1:87733983711:web:898fd8be0c26f5baef4c6a",
		measurementId: "G-6VXXE8846Y",
		// vapidKey:"xnROWMNEsOMcalt8AfKclbIypQmusf2GU4Oi1uIAFag"
		vapidKey:"BEslGYzl4snpL-NKD37KsYfRK4AJ9VflLht21b-KRYmAnFOfj4vLfl00r0Ks8MxNfqVi2ZJ4y6dSetzhhqPYmjI"
	},
};

export const baseUrl = 'https://metawin-backend.mangoitsol.com/api/';
export const serverUrl = 'https://metawin-backend.mangoitsol.com';
export const imagePath = 'https://metawin-backend.mangoitsol.com';

// export const baseUrl = 'http://103.127.29.85/mangoproject/public/api/'
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
