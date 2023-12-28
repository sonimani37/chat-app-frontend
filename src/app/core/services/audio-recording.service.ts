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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (event: any) => this.chunks.push(event.data);

            console.log('MediaRecorder initialized successfully');
        } catch (error) {
            console.error('Failed to initialize MediaRecorder:', error);
        }
    }

    async startRecording() {
        console.log(this.audioContext);

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
