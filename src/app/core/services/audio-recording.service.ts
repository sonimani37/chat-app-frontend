import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { bufferToWave } from '@core/helpers/audio-helper';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class AudioRecordingService {

    private chunks: any[] = [];
    private mediaRecorder: any;
    private audioContext: AudioContext = new AudioContext();
    private audioBlobSubject = new Subject<Blob>();

    audioBlob$ = this.audioBlobSubject.asObservable();

    constructor(private http: HttpClient) {
        // Initialize the MediaRecorder here
        this.initializeMediaRecorder();
    }

    private async initializeMediaRecorder() {
        try {

            const devices = await navigator.mediaDevices.enumerateDevices();
            // console.log(devices);
            
            const audioInputDevices = devices.filter(device => device.kind === 'audioinput');

            // console.log(audioInputDevices);
            
            if (audioInputDevices.length === 0) {
                console.error('No audio input devices found on the user\'s device.');
                // Handle this case (e.g., show a message to the user)
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // console.log(stream);
    
                this.mediaRecorder = new MediaRecorder(stream);
                // console.log(this.mediaRecorder);
    
                this.mediaRecorder.ondataavailable = (event: any) => this.chunks.push(event.data);
    
                console.log('MediaRecorder initialized successfully');
            }



        } catch (error: any) {
            if (error.name === 'NotAllowedError') {
                console.error('Permission to access the microphone was denied by the user.');
                // Handle this case (e.g., show a message to the user)
            } else {
                console.error('Failed to initialize MediaRecorder:', error);
            }
        }
    }

    async startRecording() {
        console.log(this.audioContext);
        await this.initializeMediaRecorder();

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // Check if the MediaRecorder is initialized
        if (!this.mediaRecorder) {
            console.error('MediaRecorder is not initialized. Call initializeMediaRecorder first.');
            return;
        }

        // Check if the MediaRecorder is not already in the 'recording' state
        if (this.mediaRecorder.state !== 'recording') {
            this.mediaRecorder.start();
            console.log(this.mediaRecorder.state);
        }

        // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // console.log(stream);

        // console.log(this.mediaRecorder);

        // if (this.mediaRecorder && this.mediaRecorder.state !== 'recording') {
        //     this.mediaRecorder = new MediaRecorder(stream);
        //     console.log(this.mediaRecorder);

        //     this.mediaRecorder.ondataavailable = (event: any) => this.chunks.push(event.data);
        //     this.mediaRecorder.start();

        //     console.log(this.mediaRecorder.start());
        // }
    }

    async stopRecording() {
        console.log(this.mediaRecorder);

        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.onstop = async () => {

                const audioData = await new Blob(this.chunks).arrayBuffer();
                console.log(audioData);

                const audioBuffer = await this.audioContext.decodeAudioData(audioData);
                console.log(audioBuffer);

                const wavBlob = bufferToWave(audioBuffer, audioBuffer.length);

                this.audioBlobSubject.next(wavBlob);
                this.chunks = [];
            };
            this.mediaRecorder.stop();
        }
    }
}
