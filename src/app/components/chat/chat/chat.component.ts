import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommonService } from '@core/services/common.service';
import { io, Socket } from "socket.io-client";
import { serverUrl } from 'src/environments/environment';
import { imagePath } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { FirebaseService } from '@core/services/firebase.service';
import { AudioRecordingService } from '@core/services/audio-recording.service';
import { ImagePreviewComponent } from '@components/shared/image-preview/image-preview.component';


@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit, OnDestroy {

    selectedUser: any;
    chatForm!: UntypedFormGroup | any;
    receiverId: any;
    senderId: any;
    previousMsgs: any;
    previousGroupMsgs: any;
    socket: Socket;
    chatType: string = 'single';
    viewImage: boolean[] = [];
    preImage: any;

    messages: string[] = [];
    message: string = '';
    imageUrl: any;
    selectedFile: any;
    imagePath: any = imagePath
    loginUser: any;

    allUsers: any[] = [];
    messagesss: any;

    callerId: any;
    receiver_Id: any;
    incomingCall: any;  // Information about incoming call
    callAccepted: boolean = false;

    isRecording = false;
    audioURL: string | null = null;
    @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
    @ViewChild('imageModal') imageModal: any;

    recordedData: Blob | undefined;

    constructor(private route: ActivatedRoute, private auth: AuthService, private fireService: FirebaseService,
        private commonService: CommonService, private dialog: MatDialog,
        private AudioRecordingService: AudioRecordingService, private cd: ChangeDetectorRef,
        private formBuilder: UntypedFormBuilder) {

        this.socket = io(serverUrl);

        this.senderId = localStorage.getItem('userId');
        this.loginUser = localStorage.getItem('user_data');
        this.loginUser = JSON.parse(this.loginUser);

        this.commonService.userDataEmitter.subscribe((data) => {
            this.receiverId = data.id;
            this.getUser(this.receiverId)
            this.getMessages();
            // Handle the received data as needed
        });
    }

    ngOnInit(): void {

        this.chatForm = this.formBuilder.group({
            message: ['', Validators.required],
            senderId: [this.senderId, Validators.required],
            receiverId: ['', Validators.required]
        });

        // Example: Listen for chatMessage events from the server
        this.socket.on('chatMessage', (message: any) => {
            this.commonService.listen();
            console.log(message)
            this.getMessages();
        });


        this.AudioRecordingService.audioBlob$.subscribe(blob => {
            this.recordedData = blob;
            console.log(this.recordedData);

            this.audioURL = window.URL.createObjectURL(blob);
            console.log(this.audioURL);

            // console.log(this.audioPlayer);
            // this.audioPlayer.nativeElement.src = this.audioURL;

            this.cd.detectChanges();
            this.sendMessage()
        });


        this.socket.on('callError', (message: any) => {
            console.log('------callError---5----------' + message.message)
        });

        this.socket.on('incomingCall', (message: any) => {
            console.log('-------incomingCall--5----------')
            console.log(message)
        });

        this.socket.on('callAccepted', (message: any) => {
            console.log('-------callAccepted--4----------')
            console.log(message)
        });

        this.socket.on('callEnded', (message: any) => {
            console.log('-------callEnded--4----------')
            console.log(message)
        });


        this.getAllUsers();

        // // Get callerId and receiverId from route parameters
        // this.callerId = this.route.snapshot.paramMap.get('callerId');
        // this.receiver_Id = this.route.snapshot.paramMap.get('receiverId');

        // Subscribe to incoming calls
        this.commonService.onIncomingCall().subscribe((data) => {
            this.incomingCall = true;
        });

        // Subscribe to call accepted events
        this.commonService.onCallAccepted().subscribe((data) => {
            this.callAccepted = true;
        });

        // Subscribe to call ended events
        this.commonService.onCallEnded().subscribe((data) => {
            this.incomingCall = false
            // Handle call ended logic
        });

        this.callerId = this.senderId;
    }

    getUser(userId: any) {
        var endPoint = 'getUsers?id=' + userId
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.selectedUser = result.user;
                    this.receiverId = this.selectedUser.id;
                }
            });
    }

    getMessages() {
        let dataObj = {
            senderId: this.senderId,
            receiverId: this.receiverId
        }
        var endPoint = 'chat/get-messages'
        this.auth.sendRequest('post', endPoint, dataObj).subscribe(
            (result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.previousMsgs = [];
                    this.previousMsgs = result.messages;

                    this.previousMsgs.forEach((element: any) => {

                        element.imageFile = element.ChatMedia.length > 0 ? element.ChatMedia[0].filePath : '';
                        element.message = element.message == 'null' ? '' : element.message
                        
                        if (element.senderId == this.senderId) {
                            element.isSender = true;
                            element.isReceiver = false;
                        } else {
                            element.isReceiver = true;
                            element.isSender = false;
                        }
                    });
                }
            })
    }

    isImage(message: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];  // Add more extensions if needed
        const lowerCaseMessage = message.toLowerCase();
        return imageExtensions.some(ext => lowerCaseMessage.endsWith(ext));
    }


    getImageUrl(message: string, type: string): string {
        // Assuming your images are stored in the 'uploads' folder
        if (type == 'social_image') {
            return `${message.replace('\\', '/')}`;
        } else {
            return this.imagePath + `/${message?.replace('\\', '/')}`;
        }
    }

    sendMessage() {
        var chatData: any;
        var endPoint: any
        var formData: any = new FormData();
        this.chatForm.controls['receiverId'].setValue(this.receiverId);
        this.chatForm.controls['senderId'].setValue(this.senderId);
        console.log(this.chatForm);

        if (this.chatForm.valid) {
            if (this.chatType == 'single') {
                endPoint = 'chat/send-message'
                formData.append("message", this.chatForm.value.message);
                formData.append("receiverId", this.receiverId);
                formData.append("senderId", this.chatForm.value.senderId);
                if (this.selectedFile) {

                    if (this.selectedFile.type.includes("image/")) {
                        formData.append("image", this.selectedFile);

                    } else if (this.selectedFile.type.includes("application/")) {
                        formData.append("doc", this.selectedFile);

                    } else if (this.selectedFile.type.includes("audio/")) {
                        formData.append("audio", this.selectedFile);

                    } else if (this.selectedFile.type.includes("video/")) {
                        formData.append("video", this.selectedFile);
                    }
                }

                if (this.recordedData != undefined) {
                    formData.append("audio", this.recordedData);
                }
            }

            this.auth.sendRequest('post', endPoint, formData).subscribe(
                async (result: any) => {
                    if (result.success == false) {

                    } else if (result.success == true) {
                        this.imageUrl = '';
                        this.selectedFile = '';
                        if (this.chatType == 'single') {
                            this.commonService.sendFcmNotification([this.selectedUser], this.chatForm.value, this.loginUser);
                            this.socket.emit('user-message', chatData, (error: any) => { })
                            this.getMessages();
                        }
                        this.chatForm.reset();
                        this.message = '';
                    }
                })
        }
    }

    uploadFile(event: any) {
        this.chatForm.controls['message'].clearValidators();
        this.chatForm.controls['message'].updateValueAndValidity();
        const file: File = event.target['files'][0];
        this.selectedFile = file;

        if (this.selectedFile.type.includes("image/")) {
            this.readFile();
    
        } else if (this.selectedFile.type.includes("application/")) {
            this.imageUrl = "../../../../assets/doc-icons/chat_doc_ic.png"
            this.sendMessage();

        } else if (this.selectedFile.type.includes("audio/")) {
            this.imageUrl = "../../../../assets/img/mp3_music_icon.png"
            this.sendMessage();

        } else if (this.selectedFile.type.includes("video/")) {
            this.imageUrl = "../../../../assets/doc-icons/video_ic_03.png"
            this.sendMessage();
        }
    }

    readFile(): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Set the 'imageUrl' property with the data URL of the uploaded image
            this.imageUrl = e.target?.result as string;
            console.log(this.imageUrl);
            console.log(this.selectedFile);
            
            let dialog = this.dialog.open(ImagePreviewComponent, {data: this.imageUrl});
            dialog.afterClosed().subscribe(data => {
                console.log(data);
                
                this.chatForm.get('message').setValue(data.message);
                this.sendMessage();
            })
        };
        reader.readAsDataURL(this.selectedFile as Blob);

    }

    startRecording() {
        this.chatForm.controls['message'].clearValidators();
        this.chatForm.controls['message'].updateValueAndValidity();

        this.isRecording = true;
        let recorded = this.AudioRecordingService.startRecording();

    }
                    
    stopRecording() { 
        this.isRecording = false;
        this.AudioRecordingService.stopRecording();
    }

    getAllUsers() {
        var endPoint = 'getUsers'
        this.auth.sendRequest('get', endPoint, null).subscribe(
            (result: any) => {
                result = result;
                if (result.success == false) {
                    console.log(result);
                } else if (result.success == true) {
                    this.allUsers = [];
                    result.user.forEach((element: any, index: any) => {
                        if (element.id != this.senderId) {
                            this.allUsers.push(element)
                        }
                    });
                    this.selectedUsers(this.allUsers[0]);
                    // this.selectedUser(this.allUsers[this.allUsers.length - 1]);
                }
            })
    }

    selectedUsers(userData: any) {
        this.commonService.sendUserData(userData)
    }

    deleteMessage(id: any) {
        const confirmDelete = window.confirm('Are you sure you want to delete this message?');
        if (confirmDelete) {
            var endPoint = 'chat/delete-message/' + id
            this.auth.sendRequest('delete', endPoint, null).subscribe(
                (result: any) => {
                    result = result;
                    if (result.success == false) {
                        console.log(result);
                    } else if (result.success == true) {
                        this.getMessages();
                    }
                })
        }
    }

    initiateCall(): void {
        this.callerId = this.senderId;
        console.log('------initiateCall---1----------' + this.callerId,this.receiverId);
        this.commonService.initiateCall(this.callerId, this.receiverId);

        // // Subscribe to WebRTC events
        // this.commonService.onOffer().subscribe((offer) => {
        //     // Handle offer and send answer
        //     this.handleOffer(offer);
        // });

        // this.commonService.onAnswer().subscribe((answer) => {
        //     // Handle answer
        //     this.handleAnswer(answer);
        // });

        // this.commonService.onIncomingAudio().subscribe((stream) => {
        //     // Handle incoming audio stream
        //     this.handleIncomingAudio(stream);
        // });
    }

    handleOffer(offer: any): void {
        console.log(offer);

        // // Handle the offer and create a peer connection
        // this.peer = new SimplePeer({ initiator: false, trickle: false });

        // this.peer.on('signal', (data) => {
        //     // Send the answer back to the caller
        //     this.socket.emit('answer', data);
        // });

        // // Handle incoming audio stream
        // this.peer.on('stream', (stream) => {
        //     this.onIncomingAudio().subscribe((incomingStream) => {
        //         // Handle incoming audio stream
        //         // Example: this.audioElement.srcObject = incomingStream;
        //     });
        // });

        // // Configure the peer connection with the received offer
        // this.peer.signal(offer);
    }

    handleAnswer(answer: any): void {
        console.log(answer);
        // Handle the answer using the WebRTC service
        // You may need to set up a peer connection here
        // Example: this.webrtcService.handleAnswer(answer);
    }

    handleIncomingAudio(stream: MediaStream): void {
        console.log(stream);
        // Handle incoming audio stream
        // You can use the stream to play audio on the caller's side
        // Example: this.audioElement.srcObject = stream;
    }

    acceptCall(): void {
        this.incomingCall = false;
        this.callerId = this.senderId;
        console.log('-------acceptCall--1----------' + this.callerId);
        this.commonService.acceptCall(this.callerId, this.receiverId);
    }

    endCall(): void {
        this.callAccepted = false
        this.callerId = this.senderId;

        console.log('-------endCall--1----------' + this.callerId);
        this.commonService.endCall(this.callerId, this.receiverId);
    }

    callUser() {
        const data = {
            from: this.senderId,
            to: this.receiverId,
            signalData: 'some_signal_data' // You need to implement signaling mechanism
        };
        this.fireService.callUser(data);
    }

    ngOnDestroy(): void {
        // Disconnect the socket when the component is destroyed
        this.socket.disconnect();
    }

}
