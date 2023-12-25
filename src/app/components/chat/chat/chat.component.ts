import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommonService } from '@core/services/common.service';
import { io, Socket } from "socket.io-client";
import { serverUrl } from 'src/environments/environment';
import { imagePath } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { getMessaging, getToken, onMessage } from "firebase/messaging";


@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit, OnDestroy {

    selectedUser: any;
    chatForm!: UntypedFormGroup;
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


    constructor(private route: ActivatedRoute, private auth: AuthService,
        private commonService: CommonService, private dialog: MatDialog,
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

        this.getAllUsers();

        // this.route.queryParams.subscribe(params => {
        //     this.chatType = params['type'];
        // });

        // this.route.paramMap.subscribe(params => {
        //     // Get the userId from the route
        //     this.receiverId = params.get('userId');
        // });

        // if (this.chatType == 'single') {
        //     // this.getMessages();
        //     // Example: Listen for chatMessage events from the server
        //     this.socket.on('chatMessage', (message: any) => {
        //         this.getMessages();
        //     });
        //     console.log(this.receiverId);
        //     this.getUser(this.receiverId);

        // } else if (this.chatType == 'group')  {
        //     this.getGroupMessages();
        //     this.socket.on('chatGroupMessage', (data) => {
        //         this.getGroupMessages();
        //     });
        //     this.getGroup(this.receiverId);
        // }
        // console.log(this.receiverId)

        // Get callerId and receiverId from route parameters
        this.callerId = this.route.snapshot.paramMap.get('callerId');
        this.receiver_Id = this.route.snapshot.paramMap.get('receiverId');

        // Subscribe to incoming calls
        this.commonService.onIncomingCall().subscribe((data) => {
            this.incomingCall = data;
            console.log(data);
        });

        // Subscribe to call accepted events
        this.commonService.onCallAccepted().subscribe((data) => {
            this.callAccepted = true;
        });

        // Subscribe to call ended events
        this.commonService.onCallEnded().subscribe((data) => {
            // Handle call ended logic
        });
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
                        if (element.senderId == this.senderId) {
                            element.isSender = true;
                            element.isReceiver = false;
                        } else {
                            element.isReceiver = true;
                            element.isSender = false;
                        }

                        if (this.message.includes('uploads/file')) {

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
        if (this.chatForm.valid) {
            if (this.chatType == 'single') {
                endPoint = 'chat/send-message'
                formData.append("message", this.chatForm.value.message);
                formData.append("receiverId", this.receiverId);
                formData.append("senderId", this.chatForm.value.senderId);
                if (this.selectedFile) {
                    formData.append("files", this.selectedFile);
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
        if (this.selectedFile) {
            this.readFile();
        }
    }

    readFile(): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Set the 'imageUrl' property with the data URL of the uploaded image
            this.imageUrl = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile as Blob);
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

    deleteMessage(items: any) {
        console.log(items);
        const confirmDelete = window.confirm('Are you sure you want to delete this message?');
        if (confirmDelete) {

        }
    }

    deleteAllMessage(items: any) {

    }


    initiateCall(): void {
        this.callerId = this.senderId;
        console.log(this.callerId);
        this.commonService.initiateCall(this.callerId, this.receiverId);
    }

    acceptCall(): void {
        this.callerId = this.senderId;
        this.commonService.acceptCall(this.callerId, this.receiverId);
    }

    endCall(): void {
        this.callerId = this.senderId;
        this.commonService.endCall(this.callerId, this.receiverId);
    }



    ngOnDestroy(): void {
        // Disconnect the socket when the component is destroyed
        this.socket.disconnect();
    }

}
