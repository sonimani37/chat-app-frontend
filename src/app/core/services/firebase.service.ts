import { Injectable } from '@angular/core';
import { getMessaging, getToken } from "firebase/messaging";
import { environment } from "@env/environment"
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

    constructor(private auth: AuthService) { }
    requestPermission(data?: any) {
        console.log(data)
        const messaging = getMessaging();
        console.log(messaging)
        getToken(messaging, { vapidKey: environment.firebase.vapidKey })
            .then((currentToken) => {
                if (currentToken) {
                    console.log(currentToken);
                    this.sendTokenToBackend(data.userId,currentToken);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
            });
    }


    sendTokenToBackend(userId:any,token: string) {

        let tokenData ={
            userId: userId,
            fcmtoken: token
        }
        var endPoint = '/store-fcm-token'
        this.auth.sendRequest('post', endPoint, tokenData ).subscribe(
            (result: any) => {
                console.log(result)
                // if (result.success == false) {

                // } else if (result.success == true) {

                // }
            })
    }
}
