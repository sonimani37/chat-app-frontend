import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AudioCallService } from '@core/services/audio-call.service';
// import { Device }from 'twilio-client';

@Component({
    selector: 'app-voice-call',
    templateUrl: './voice-call.component.html',
    styleUrls: ['./voice-call.component.css']
})
export class VoiceCallComponent implements OnInit {

    private token: any;
    private device: any;
    private connection: any;
    
    localStream: MediaStream | undefined;
    @Output() callEvent = new EventEmitter<boolean>();

    constructor(private audioCallService: AudioCallService) { }

    ngOnInit(): void {

        // Set up WebRTC here
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.localStream = stream;
                // Use the stream for communication
            })
            .catch(error => {
                console.error('Error accessing microphone:', error);
            });
    }

    startCall() {
        this.audioCallService.startCall();
      }

    // Get Twilio token from your server
    // This should be generated on the server side and securely passed to the client
    // this.token = '06a9e3f690c2d6d5ff2a69d63baef6ce';
    // this.setupTwilioDevice();
    // }

    // async startCall(): Promise<void> {
    //     await this.audioCallService.startCall();
    //   }

    //   endCall(): void {
    //     this.audioCallService.endCall();
    //   }



    // makeCall() {
    //     // this.device = new Device();
    //     this.device.setup('06a9e3f690c2d6d5ff2a69d63baef6ce', { debug: true });

    //     this.device.connect({
    //       to: +917697570957,
    //       from: +917697570957,
    //       audioConstraints: { optional: [{ googAutoGainControl: false }] },
    //     });
    //   }

    //   endCall() {
    //     this.device.disconnectAll();
    //   }

    // setupTwilioDevice(): void {
    //     this.device = new Device(this.token, {
    //         debug: true,
    //     });

    //     this.device.on('ready', (device: any) => {
    //         console.log('Twilio Device is ready for calls');
    //     });

    //     this.device.on('error', (error: any) => {
    //         console.error('Twilio Device Error: ', error.message);
    //     });

    //     this.device.on('connect', (conn: any) => {
    //         console.log('Successfully established call connection');
    //         this.connection = conn;
    //     });
    // }

    // makeCall(): void {
    //     const params = { To: '+917697570957' }; // Replace with the destination number
    //     this.connection = this.device.connect(params);

    //     this.connection.on('disconnect', () => {
    //         console.log('Call disconnected');
    //     });
    // }

    // answerCall(): void {
    //     // Implement logic to answer an incoming call
    //     if (this.connection) {
    //         this.connection.accept();
    //     }
    // }

    // hangUp(): void {
    //     // Implement logic to hang up the call
    //     if (this.connection) {
    //         this.connection.disconnect();
    //     }
    // }
}
