import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreateGroupComponent } from '@components/chat/create-group/create-group.component';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.css']
})
export class ImagePreviewComponent {
  constructor(public dialogRef: MatDialogRef<CreateGroupComponent>,
    
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      console.log(data);
      
    }

  close(data: any) {

    this.dialogRef.close(data);
  }

}
