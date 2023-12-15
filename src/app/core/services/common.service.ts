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

    constructor(public http: HttpClient) { }

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
        onMessage(messaging, (payload) => {
            // Update the title with a notification badge
            this.message = payload;
            // Increment the unread notification count
            this.unreadNotificationCount++;
            // Update the title with the unread count
            this.updateTitleBadge();
        });
    }

    updateTitleBadge() {
        // Check if the Notification API is supported
        if ('Notification' in window) {

            // // Check if the current page is focused
            // if (document.hasFocus()) {
            //     return; // Do not show badge if the page is focused
            // }

            // Check if permission to display notifications has been granted
            if (Notification.permission === 'granted') {
                // Create a notification badge
                document.title = `🔔(${this.unreadNotificationCount}) Notification`;
                document.addEventListener('click', this.onDocumentTitleClick.bind(this));

                const notification = new Notification('New Notification', {
                    // You can customize the notification options here
                    // For example, you can set an icon, body, etc.
                    // body: 'Notification body text',
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

    onDocumentTitleClick() {
        // Handle the click on the document title
        this.markNotificationsAsRead();
      }

    // Call this function when a user reads the notifications
    markNotificationsAsRead() {
        this.unreadNotificationCount = 0;

        // Update the title without the unread count
        document.title = 'Conversa Connect';
    }

    requestPermission() {
        const messaging = getMessaging();
        console.log(messaging);

        getToken(messaging, { vapidKey: environment.firebase.vapidKey })
            .then((currentToken) => {
                if (currentToken) {
                    console.log("we got the token.....");
                    console.log(currentToken);
                    this.sendFcmNotification(currentToken)
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
            });
    }

    sendFcmNotification(serverKey: any) {
        const headers = new HttpHeaders({
            'Authorization': `key=AAAAFG1aWd8:APA91bEWB74HoPrLMe-Tpo4NDROBPzc87xxxGFUNafZwV-hxfBQKEqLJq6TRyMGk3Z0Sh6LALSt_cjdQFnaayhiohGG5nWaCaIs7Xdtib4l-b83pqS-NpiU36Z9orx3GaA3Iru9tqU2t`,
            'Content-Type': 'application/json'
        });

        const notificationData = {
            notification: {
                title: 'Notification',
                body: 'Hello from angular app',
                // icon: '../assets/731657547631815CRISTIANORONALDOMenSetOf2CR7GameOnEaudeToiletteCR7BodySprayC1.jpg',
                // image: '../assets/1671012101618-PERFUMERS-CLUB-Women-Set-of-7-Complete-Fragrance-Eau-De-Parf-5.jpg',
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
