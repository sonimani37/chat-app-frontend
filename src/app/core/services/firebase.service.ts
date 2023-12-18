import { Injectable } from '@angular/core';
// import { AngularFireMessaging } from '@angular/fire/messaging';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

    // constructor(private afMessaging: AngularFireMessaging) { }

    // requestPushNotificationsPermission() {
    //     this.afMessaging.requestToken.subscribe(
    //         (token:any) => {
    //             // Send the token to your backend to associate it with the user
    //             console.log('Permission granted! Token:', token);
    //         },
    //         (error:any) => {
    //             console.error('Unable to get permission to notify.', error);
    //         }
    //     );
    // }
}
