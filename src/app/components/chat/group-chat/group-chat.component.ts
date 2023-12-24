import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
    imagePath: any = imagePath;
    allGroups: any[] = [];
    loginUser: any;

    constructor(private route: ActivatedRoute, private auth: AuthService, private commonService: CommonService, private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder) {

        this.socket = io(serverUrl);
        this.senderId = localStorage.getItem('userId');
        this.loginUser = localStorage.getItem('user_data');
        this.loginUser = JSON.parse(this.loginUser);

        this.commonService.groupDataEmitter.subscribe((data) => {
            this.receiverId = data?.id;
            this.getGroup(this.receiverId)
            this.getGroupMessages();
        });

    }

    ngOnInit(): void {

        this.chatForm = this.formBuilder.group({
            message: ['', Validators.required],
            senderId: [this.senderId, Validators.required],
            receiverId: ['', Validators.required]
        });

        this.getAllGroups()
        if (this.chatType == 'group') {
            this.socket.on('chatGroupMessage', (data) => {
                this.getGroupMessages();
            });
        }
    }

    getGroup(userId: any) {
        var endPoint = 'group?id=' + userId
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.selectedGroup = result.group;
                    this.receiverId = result.group.id;
                    console.log(this.selectedGroup);

                }
            });
    }

    onFileSelected(event: any, groupId: any): void {
        this.selectedFile = event.target.files[0] as File;
        this.onSubmit(groupId);
    }

    onSubmit(groupId: any): void {
        if (!this.selectedFile) {
            console.error('No file selected');
            return;
        }
        const formData: FormData = new FormData();
        formData.append('image', this.selectedFile, this.selectedFile.name);

        var endPoint = '/group/update/' + groupId
        this.auth.sendRequest('post', endPoint, formData)
            .subscribe((result: any) => {
                if (result.success == false) {
                } else if (result.success == true) {
                    this.ngOnInit();
                    this.auth.userImage.next(result.user);
                }
            })
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
        this.chatForm.controls['receiverId'].setValue(this.receiverId);
        this.chatForm.controls['senderId'].setValue(this.senderId);
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
                            this.socket.emit('group-message', chatData);
                            this.getGroupMessages();
                        }
                        this.chatForm.reset();
                        this.message = '';

                    }
                })
        }
    }

    uploadFile(event: any) {
        const file: File = event.target['files'][0];
        this.selectedFile = file;
        if (this.selectedFile) {
            this.readFile();
        }
    }

    readFile(): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imageUrl = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile as Blob);
    }

    getAllGroups() {
        var endPoint = 'group'
        this.auth.sendRequest('get', endPoint, null)
            .subscribe((result: any) => {
                if (result.success == false) {

                } else if (result.success == true) {
                    this.allGroups = [];
                    this.allGroups = result.groups
                    this.selectedGroups(this.allGroups[0]);
                }
            });
    }

    selectedGroups(groupData: any) {
        this.commonService.sendGroupData(groupData)
    }


    isImage(message: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];  // Add more extensions if needed
        const lowerCaseMessage = message.toLowerCase();
        return imageExtensions.some(ext => lowerCaseMessage.endsWith(ext));
    }

    getImageUrl(message: string): string {
        return this.imagePath + `/${message?.replace('\\', '/')}`;
    }

    ngOnDestroy(): void {
        this.socket.disconnect();
    }

}

