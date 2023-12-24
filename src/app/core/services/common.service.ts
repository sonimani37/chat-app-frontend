import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { environment } from "@env/environment"

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
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | any;


    constructor(public http: HttpClient) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 16;
        this.canvas.height = 16;
        this.context = this.canvas.getContext('2d');
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
        const messaging = getMessaging();
        onMessage(messaging, (payload: any) => {
            let currentUserId = localStorage.getItem('userId');
            let notification = payload?.notification?.body ? JSON.parse(payload?.notification?.body) : {};

            if (currentUserId == notification.receiverId) {
                this.message = payload;
                if (!document.hasFocus()) {
                    this.unreadNotificationCount++;
                }
                this.updateTitleBadge();
            }

        });
    }


    updateTitleBadge() {
        console.log(this.unreadNotificationCount);

        // Check if the Notification API is supported
        if ('Notification' in window) {

            // Check if the current page is focused
            // if (document.hasFocus()) {
            //     return; // Do not show badge if the page is focused
            // }

            // Check if permission to display notifications has been granted
            // if (Notification.permission === 'granted') {
            // Clear canvas
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw a red circle (you can customize the appearance)
            this.context.beginPath();
            this.context.arc(8, 8, 8, 0, 2 * Math.PI);
            this.context.fillStyle = 'red';
            this.context.fill();

            // Draw the count in white
            this.context.fillStyle = 'white';
            this.context.font = '11px sans-serif';
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.fillText(this.unreadNotificationCount.toString(), 8, 8);

            // Update the favicon
            const link: any = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = this.canvas.toDataURL('image/x-icon');
            document.head.appendChild(link);
            // }

        }
    }

    // Call this function when a user reads the notifications
    markNotificationsAsRead() {
        this.unreadNotificationCount = 0;
        document.title = 'Conversa Connect';
    }

    requestPermission(data?: any) {
        const messaging = getMessaging();
        getToken(messaging, { vapidKey: environment.firebase.vapidKey })
            .then((currentToken) => {
                if (currentToken) {
                    this.sendFcmNotification(currentToken, data)
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
            });
    }

    sendFcmNotification(serverKey: any, data?: any) {
        const headers = new HttpHeaders({
            'Authorization': `key=AAAAFG1aWd8:APA91bEWB74HoPrLMe-Tpo4NDROBPzc87xxxGFUNafZwV-hxfBQKEqLJq6TRyMGk3Z0Sh6LALSt_cjdQFnaayhiohGG5nWaCaIs7Xdtib4l-b83pqS-NpiU36Z9orx3GaA3Iru9tqU2t`,
            'Content-Type': 'application/json'
        });

        const notificationData = {
            notification: {
                title: 'Notification',
                body: data,
                icon: '../../../assets/img/favicon.png',
                image: '../../../assets/img/faces/clem-onojeghuo-1.jpg',
                vibrate: [200, 100, 200],
                data: {
                    customKey1: 'Custom Value 1',
                    customKey2: 'Custom Value 2',
                },
            },
            to: `${serverKey}`
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
    }

}
