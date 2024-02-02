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
    selectGroupImg:any
    imagePath: any = imagePath;
    allGroups: any[] = [];
    loginUser: any;


    isRecording = false;
    audioURL: string | null = null;
    @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
    recordedData: Blob | undefined;

    constructor(private route: ActivatedRoute, private auth: AuthService, private commonService: CommonService, private dialog: MatDialog,
        private AudioRecordingService: AudioRecordingService, private cd: ChangeDetectorRef,
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

        this.getAllGroups();
        if (this.chatType == 'group') {
            this.socket.on('chatGroupMessage', (data) => {
                this.getGroupMessages();
            });
        }

        this.AudioRecordingService.audioBlob$.subscribe(blob => {
            this.recordedData = blob;
            console.log(this.recordedData);

            this.audioURL = window.URL.createObjectURL(blob);
            console.log(this.audioURL);

            // console.log(this.audioPlayer);
            // this.audioPlayer.nativeElement.src = this.audioURL;

            this.cd.detectChanges();
        });
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

    onFileSelected(event: any, groupId: any): void {
        this.selectGroupImg = event.target.files[0] as File;
        this.onSubmit(groupId);
    }

    onSubmit(groupId: any): void {
        if (!this.selectGroupImg) {
            console.error('No file selected');
            return;
        }
        const formData: FormData = new FormData();
        formData.append('image', this.selectGroupImg, this.selectGroupImg.name);

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
                    console.log(this.previousGroupMsgs);
                    
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

        console.log(this.chatForm);
        
        // if (this.chatForm.valid) {
            if (this.chatType == 'group') {
                endPoint = 'group/send-message'
                formData.append("message", this.chatForm.value.message);
                formData.append("groupId", this.receiverId);
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
                    console.log(this.recordedData);
                    formData.append("audio", this.recordedData);
                }
            }
            this.auth.sendRequest('post', endPoint, formData).subscribe(
                (result: any) => {
                    if (result.success == false) {

                    } else if (result.success == true) {
                        if (this.chatType == 'group') {
                            this.commonService.sendFcmNotification(this.selectedGroup.user,this.chatForm.value,this.loginUser); 
                            this.socket.emit('group-message', chatData);
                             this.selectedFile = '';
                             this.recordedData = undefined;
                            this.getGroupMessages();
                        }
                        this.chatForm.reset();
                        this.message = '';
                        this.imageUrl='';

                    }
                })
        // }
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

        } else if (this.selectedFile.type.includes("audio/")) {
            this.imageUrl = "../../../../assets/img/mp3_music_icon.png"

        } else if (this.selectedFile.type.includes("video/")) {
            this.imageUrl = "../../../../assets/doc-icons/video_ic_03.png"
        }
    }

    readFile(): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imageUrl = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile as Blob);
    }

    startRecording() {
        this.chatForm.controls['message'].clearValidators();
        this.chatForm.controls['message'].updateValueAndValidity();

        this.isRecording = true;
        let recorded = this.AudioRecordingService.startRecording();
        console.log(recorded);

    }

    stopRecording() {
        this.isRecording = false;
        this.AudioRecordingService.stopRecording();
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

    getImageUrl(message: string, type: string): string {
        if (type == 'social_image') {
            return `${message.replace('\\', '/')}`;
        } else {
            return this.imagePath + `/${message?.replace('\\', '/')}`;
        }
    }

    deleteMessage(id: any) {
        const confirmDelete = window.confirm('Are you sure you want to delete this message?');
        if (confirmDelete) {
            var endPoint = 'group/delete-message/' + id
            this.auth.sendRequest('delete', endPoint, null).subscribe(
                (result: any) => {
                    result = result;
                    if (result.success == false) {
                        console.log(result);
                    } else if (result.success == true) {
                        this.getGroupMessages();
                    }
                })
        }
    }

    ngOnDestroy(): void {
        this.socket.disconnect();
    }

}

