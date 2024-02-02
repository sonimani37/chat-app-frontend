import { Injectable } from '@angular/core';
import { getMessaging, getToken } from "firebase/messaging";
import { environment } from "@env/environment"
import { AuthService } from './auth.service';
import { io, Socket } from 'socket.io-client';
import { serverUrl } from '@env/environment';
// import * as SimplePeer from 'simple-peer';
// import { SimplePeer } from 'simple-peer';
// import * as SimplePeer from 'simple-peer';



@Injectable({
    providedIn: 'root'
})
export class FirebaseService {

    socket: Socket;
    peer: any;
    userId = localStorage.getItem('userId');

    constructor(private auth: AuthService) {
        this.socket = io(serverUrl);

        // this.peer = SimplePeer({ initiator: true, trickle: false })
    }

    joinRoom(userId: string): void {
        this.userId = userId;
        this.socket.emit('join', userId);
    }

    callUser(data: any): void {
        // this.peer = new SimplePeer({ initiator: true, trickle: false });

        // this.peer.on('signal', (signal:any) => {
        //     const newData = {
        //       from: data.from,
        //       to: data.to,
        //       signalData: signal,
        //     };
        //     this.socket.emit('callUser', newData);
        // });
      
        // this.peer.on('connect', () => {
        // // Handle connection established
        // console.log('Connection established');
        // });

          

        // console.log(this.peer)
        // this.socket.emit('callUser', data);
    }

    answerCall(data: any): void {
        this.socket.emit('answerCall', data);
    }

    on(event: string, callback: (data: any) => void): void {
        this.socket.on(event, callback);
    }

    requestPermission(data?: any) {
        console.log(data)
        const messaging = getMessaging();
        console.log(messaging)
        getToken(messaging, { vapidKey: environment.firebase.vapidKey })
            .then((currentToken) => {
                if (currentToken) {
                    this.sendTokenToBackend(data.userId, currentToken);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
            });
    }


    sendTokenToBackend(userId: any, token: string) {
        var endPoint = 'updateProfile/' + userId
        this.auth.sendRequest('post', endPoint, { fcmtoken: token }).subscribe(
            (result: any) => {
                console.log(result)
            })
    }
}
