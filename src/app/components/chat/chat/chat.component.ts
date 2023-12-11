import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ImagePreviewModalComponent } from '@components/shared/image-preview-modal/image-preview-modal.component';
import { AuthService } from '@core/services/auth.service';
import { CommonService } from '@core/services/common.service';
import { io, Socket } from "socket.io-client";
import { serverUrl } from 'src/environments/environment';
import { imagePath } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';


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

    constructor(private route: ActivatedRoute, private auth: AuthService,
        private commonService: CommonService, private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder) {

        this.socket = io(serverUrl);

        this.commonService.userDataEmitter.subscribe((data) => {
            this.receiverId = data.id;
            this.getUser(this.receiverId)
            this.getMessages();
            // Handle the received data as needed
        });
    }

    ngOnInit(): void {
        this.senderId = localStorage.getItem('userId');

        this.chatForm = this.formBuilder.group({
            message: ['', Validators.required],
            senderId: [this.senderId, Validators.required],
            receiverId: ['', Validators.required]
        });

        // Example: Listen for chatMessage events from the server
        this.socket.on('chatMessage', (message: any) => {
            this.getMessages();
        });

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

    getImageUrl(message: string): string {
        // Assuming your images are stored in the 'uploads' folder
        return this.imagePath + `/${message.replace('\\', '/')}`;
    }

    sendMessage() {
        var chatData: any;
        var endPoint: any
        var formData: any = new FormData();
        console.log(this.chatForm);
        
        if(this.chatForm.valid){
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
                (result: any) => {
                    if (result.success == false) {

                    } else if (result.success == true) {
                        this.imageUrl = '';
                        this.selectedFile = '';
                        if (this.chatType == 'single') {
                            this.socket.emit('user-message', chatData, (error: any) => { })
                            this.getMessages();

                        }
                        this.message = '';
                        this.chatForm.reset();

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

    openImagePreview(imageUrl: string): void {
        this.dialog.open(ImagePreviewModalComponent, {
            data: { imageUrl },
        });
    }

    ngOnDestroy(): void {
        // Disconnect the socket when the component is destroyed
        this.socket.disconnect();
    }

}
