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
    imagePath:any = imagePath

    constructor(private route: ActivatedRoute, private auth: AuthService,
         private commonService: CommonService,private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder) {
        this.socket = io(serverUrl);
        this.commonService.userDataEmitter.subscribe((data) => {
            this.receiverId = data.id;
            this.getUser(this.receiverId)
            this.getMessages();
            console.log(this.receiverId);
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
        console.log(userId);

        var endPoint = 'getUsers?id=' + userId
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.selectedUser = result.user;
                    console.log(this.selectedUser);
                    this.receiverId = this.selectedUser.id;
                }
            });
    }

    getGroup(userId: any) {
        var endPoint = 'group?id=' + userId
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.selectedUser = result.group;
                }
            });
    }

    getMessages() {
        console.log(this.receiverId);

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
                    console.log(this.previousMsgs);
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
        console.log(this.chatForm.value);

        this.chatType = 'single';
        if (this.chatType == 'single') {
            endPoint = 'chat/send-message'
            chatData = {
                message: this.chatForm.value.message,
                receiverId: this.receiverId,
                senderId: this.chatForm.value.senderId
            }
        } else if (this.chatType == 'group') {
            endPoint = 'group/send-message'
            chatData = {
                message: this.chatForm.value.message,
                groupId: this.chatForm.value.receiverId,
                senderId: this.chatForm.value.senderId
            }
        }
        console.log(chatData);

        this.auth.sendRequest('post', endPoint, chatData).subscribe(
            (result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    if (this.chatType == 'single') {
                        this.socket.emit('user-message', chatData, (error: any) => { })
                        this.getMessages();

                    } else if (this.chatType == 'group') {
                        // Emit the message to the group
                        this.socket.emit('group-message', chatData);
                        this.getGroupMessages();
                    }
                    this.message = '';
                    this.chatForm.reset();

                }
            })
    }

    uploadFile(event: any) {
        // this.chatForm.controls['message'].clearValidators();
        // this.chatForm.controls['message'].updateValueAndValidity();
        const file: File = event.target['files'][0];
        this.selectedFile = file;
        if (this.selectedFile) {
            this.readFile();
        }

        // const reader: FileReader = new FileReader();
        // reader.readAsDataURL(file);
        // var url: any;
        // let self = this
        // reader.onload = function (_event) {
        //   url = reader.result;
        //   var imagee: HTMLImageElement = new Image();
        //   imagee.src = URL.createObjectURL(file);
        //   imagee.onload = (e: any) => {
        //     const imagee = e.path[0] as HTMLImageElement;
        //     console.log(imagee);
        //   }
        // }
    }

    readFile(): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Set the 'imageUrl' property with the data URL of the uploaded image
            this.imageUrl = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile as Blob);
        // this.openImagePreview(this.selectedFile)
        console.log(this.imageUrl);
        console.log(this.selectedFile);

    }

    openImagePreview(imageUrl: string): void {
        this.dialog.open(ImagePreviewModalComponent, {
          data: { imageUrl },
        });
      }

    // previewImage(id: number, image: string) {
    //     this.viewImage[id] = true;
    //     this.preImage = image;
    //     $('#imagePriview').modal('show')
    // }

    // closePreviewImage() {
    //     $('#imagePriview').modal('hide')
    // }

    ngOnDestroy(): void {
        // Disconnect the socket when the component is destroyed
        this.socket.disconnect();
    }

}
