import { Injectable } from '@angular/core';
import { Socket,io } from 'socket.io-client';
import { serverUrl } from '@env/environment';
import { SimplePeer } from 'simple-peer';


@Injectable({
  providedIn: 'root'
})
export class AudioCallService {

  private peerConnection: RTCPeerConnection;

  SimplePeer: SimplePeer | any;
  socket: Socket;
  peer: any;

  constructor() {     
    this.socket = io(serverUrl);
    this.peer = this.SimplePeer();
    this.peerConnection = new RTCPeerConnection();
  }

  async startCall(): Promise<void> {
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, localStream);
    });

    // Logic to handle signaling and set up the WebRTC connection
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Send the offer to the server for signaling
    // This step is part of your signaling logic
  }

  endCall(): void {
    // Logic to close the WebRTC connection
    this.peerConnection.close();
  }

}
