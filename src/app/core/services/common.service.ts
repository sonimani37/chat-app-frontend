import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { environment } from "@env/environment"
import { ActivatedRoute } from '@angular/router';
import { io, Socket } from "socket.io-client";
import { serverUrl } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class CommonService {

    userDataEmitter: EventEmitter<any> = new EventEmitter<any>();
    groupDataEmitter: EventEmitter<any> = new EventEmitter<any>();
    menupDataEmitter: EventEmitter<any> = new EventEmitter<any>();

    message: any = null;
    fcmUrl = 'https://fcm.googleapis.com/fcm/send';
    unreadNotificationCount = 0;
    socket: Socket;


    constructor(public http: HttpClient, public route: ActivatedRoute) {
        this.socket = io(serverUrl);
    }

    sendUserData(userData: any): void {
        this.userDataEmitter.emit(userData);
    }

    sendGroupData(groupData: any): void {
        this.groupDataEmitter.emit(groupData)
    }

    sendMenuData(menuName: any): void {
        this.menupDataEmitter.emit(menuName)
    }

    listen() {
        console.log('innnnn listen()');
        const messaging = getMessaging();
        onMessage(messaging, (payload: any) => {
            let currentUserId = localStorage.getItem('userId');

            // let notification = payload?.notification?.body ? JSON.parse(payload?.notification?.body) : {};
            // if (currentUserId == notification.receiverId) {
            this.message = payload;
            // if (!document.hasFocus()) {
            this.unreadNotificationCount++;
            // }
            this.updateTitleBadge();
            // }

        });
    }

    updateTitleBadge() {
        // Check if the Notification API is supported
        if ('Notification' in window) {
            // Check if the current page is focused
            if (document.hasFocus()) {
                return; // Do not show badge if the page is focused
            }

            // Check if permission to display notifications has been granted
            if (Notification.permission === 'granted') {
                // Create a notification badge
                document.title = `🔔(${this.unreadNotificationCount}) Notification`;
                document.addEventListener('click', this.onDocumentTitleClick.bind(this));

                const notification = new Notification('New Notification', {
                    icon: '../../../assets/img/favicon.png', // Provide the correct path to your icon
                });

                // You can add an event listener to handle clicks on the notification
                notification.onclick = () => {
                    // Handle the click event as needed (e.g., navigate to a specific page)
                    console.log('Notification clicked');
                    this.markNotificationsAsRead();
                };
            }
        }
    }

    // Call this function when a user reads the notifications
    markNotificationsAsRead() {
        this.unreadNotificationCount = 0;
        document.title = 'Conversa Connect';
    }

    onDocumentTitleClick() {
        // Handle the click on the document title
        this.markNotificationsAsRead();
    }

    sendFcmNotification(serverKey: any, data?: any, senderinfo?: any) {
        console.log(serverKey);
        console.log(data);
        console.log(senderinfo);

        const headers = new HttpHeaders({
            'Authorization': `key=AAAAFG1aWd8:APA91bEWB74HoPrLMe-Tpo4NDROBPzc87xxxGFUNafZwV-hxfBQKEqLJq6TRyMGk3Z0Sh6LALSt_cjdQFnaayhiohGG5nWaCaIs7Xdtib4l-b83pqS-NpiU36Z9orx3GaA3Iru9tqU2t`,
            'Content-Type': 'application/json'
        });
        serverKey.forEach((user: any) => {
            const notificationData = {
                notification: {
                    title: senderinfo.firstname + " " + senderinfo.lastname,
                    body: data.message,
                    image: user?.UserImages?.filePath,
                    icon: '/assets/img/favicon.png',
                    click_action: window.location.origin,
                    vibrate: [200, 100, 200],
                },
                to: `${user.fcmtoken}`
            };
            this.http.post(this.fcmUrl, notificationData, { headers })
                .subscribe(
                    (response) => {
                        console.log('Notification sent successfully:', response);
                    },
                    (error) => {
                        console.error('Error sending notification:', error);
                    }
                );
        });

    }

    initiateCall(callerId: number, receiverId: number): void {
        console.log(callerId, receiverId);

        this.socket.emit('call', { callerId, receiverId });
    }

    acceptCall(callerId: number, receiverId: number): void {
        this.socket.emit('acceptCall', { callerId, receiverId });
    }

    endCall(callerId: number, receiverId: number): void {
        this.socket.emit('endCall', { callerId, receiverId });
    }

    onIncomingCall(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('incomingCall', (data) => observer.next(data));
        });
    }

    onCallAccepted(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('callAccepted', (data) => observer.next(data));
        });
    }

    onCallEnded(): Observable<any> {
        return new Observable((observer) => {
            this.socket.on('callEnded', (data) => observer.next(data));
        });
    }

}
