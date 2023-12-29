import { Component, OnInit } from '@angular/core';
import { Device }from 'twilio-client';

@Component({
    selector: 'app-voice-call',
    templateUrl: './voice-call.component.html',
    styleUrls: ['./voice-call.component.css']
})
export class VoiceCallComponent implements OnInit {

    private token: any;
    private device: any;
    private connection: any;

    ngOnInit(): void {
        // Get Twilio token from your server
        // This should be generated on the server side and securely passed to the client
        this.token = '06a9e3f690c2d6d5ff2a69d63baef6ce';

        this.setupTwilioDevice();
    }

    setupTwilioDevice(): void {
        this.device = new Device(this.token, {
            debug: true,
        });

        this.device.on('ready', (device: any) => {
            console.log('Twilio Device is ready for calls');
        });

        this.device.on('error', (error: any) => {
            console.error('Twilio Device Error: ', error.message);
        });

        this.device.on('connect', (conn: any) => {
            console.log('Successfully established call connection');
            this.connection = conn;
        });
    }

    makeCall(): void {
        const params = { To: '+917697570957' }; // Replace with the destination number
        this.connection = this.device.connect(params);

        this.connection.on('disconnect', () => {
            console.log('Call disconnected');
        });
    }

    answerCall(): void {
        // Implement logic to answer an incoming call
        if (this.connection) {
            this.connection.accept();
        }
    }

    hangUp(): void {
        // Implement logic to hang up the call
        if (this.connection) {
            this.connection.disconnect();
        }
    }
}
