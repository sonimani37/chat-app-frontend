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
    selector: 'app-group-chat',
    templateUrl: './group-chat.component.html',
    styleUrls: ['./group-chat.component.css']
})
export class GroupChatComponent implements OnInit, OnDestroy {

    selectedGroup: any;
    chatForm!: UntypedFormGroup;
    receiverId: any;
    senderId: any;
    previousMsgs: any;
    previousGroupMsgs: any;
    socket: Socket;
    chatType: string = 'group';
    viewImage: boolean[] = [];
    preImage: any;

    messages: string[] = [];
    message: string = '';
    imageUrl: any;
    selectedFile: any;
    imagePath: any = imagePath

    constructor(private route: ActivatedRoute, private auth: AuthService, private commonService: CommonService, private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder) {

        this.socket = io(serverUrl);

        this.commonService.groupDataEmitter.subscribe((data) => {
            this.receiverId = data.id;
            this.getGroup(this.receiverId)
            this.getGroupMessages();
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

        if (this.chatType == 'group') {
            // this.getGroupMessages();
            this.socket.on('chatGroupMessage', (data) => {
                this.getGroupMessages();
            });
            //  console.log(this.receiverId);
            //   this.getGroup(this.receiverId);
        }

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

    getGroup(userId: any) {
        var endPoint = 'group?id=' + userId
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.selectedGroup = result.group;
                    this.receiverId = result.group.id;
                }
            });
    }

    getGroupMessages() {
        let dataObj = {
            groupId: this.receiverId
        }
        var endPoint = 'group/get-messages'
        this.auth.sendRequest('post', endPoint, dataObj).subscribe(
            (result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.previousGroupMsgs = [];
                    this.previousGroupMsgs = result.messages;
                    this.previousGroupMsgs.forEach((element: any) => {
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

    sendMessage() {
        var chatData: any;
        var endPoint: any;
        var formData: any = new FormData();
        if (this.chatForm.valid) {
            if (this.chatType == 'group') {
                endPoint = 'group/send-message'
                formData.append("message", this.chatForm.value.message);
                formData.append("groupId", this.receiverId);
                formData.append("senderId", this.chatForm.value.senderId);
                if (this.selectedFile) {
                    formData.append("files", this.selectedFile);
                }
            }
            this.auth.sendRequest('post', endPoint, formData).subscribe(
                (result: any) => {
                    if (result.success == false) {

                    } else if (result.success == true) {
                        if (this.chatType == 'group') {
                            // Emit the message to the group
                            this.socket.emit('group-message', chatData);
                            this.getGroupMessages();
                        }
                        this.message = '';
                        this.chatForm.reset();

                    }
                })
        }
    }

    uploadFile(event: any) {
        // this.chatForm.controls['message'].clearValidators();
        // this.chatForm.controls['message'].updateValueAndValidity();
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

    isImage(message: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];  // Add more extensions if needed
        const lowerCaseMessage = message.toLowerCase();
        return imageExtensions.some(ext => lowerCaseMessage.endsWith(ext));
    }

    getImageUrl(message: string): string {
        // Assuming your images are stored in the 'uploads' folder
        return this.imagePath + `/${message.replace('\\', '/')}`;
    }

    ngOnDestroy(): void {
        // Disconnect the socket when the component is destroyed
        this.socket.disconnect();
    }

}

