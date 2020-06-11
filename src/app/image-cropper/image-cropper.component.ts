import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy,
  AfterViewInit, OnChanges, Output, EventEmitter, Inject } from '@angular/core';
import Cropper from 'cropperjs';
import { CustomResponse } from '../models/CustomResponse';
import { Subscription } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { UserService } from '../services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA  } from '@angular/material/dialog';


@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

  loading: boolean;
  subscriptions: Subscription[] = [];

  @ViewChild('image') public imageElement: ElementRef;
  imageSource: string | ArrayBuffer;
  fileToUpload: any;

  previewImgSrc: any;

  imageReady: boolean;

  private MAXFILESIZE = 5000000; // 5MB limit
  private suportedFiles = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/webp'];

  public imageDestination: string;

  initialized: boolean;

  private cropper: Cropper;

  constructor(
    private userService: UserService,
    private matDialogRef: MatDialogRef<ImageCropperComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.imageDestination = '';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
    sub.unsubscribe();
    });
  }

  /**
   *  Check for when the value of the image source comming in has changed and update the cropper with it
   */
  ngOnChanges() {

  }

  /**
   * After intitializing the view we need to instatiate the cropper
   */
  ngAfterViewInit() {
    this.initializeCropper();

  }

  /**
   * Save the image to the database.
   * On successful update we emit a response to the parent component so it can update its data and close the modal.
   */
  saveImg() {
    this.loading = true;
    this.fileToUpload.value = this.imageDestination;
    this.subscriptions.push(this.userService.updateUserAvatar(this.fileToUpload.value, this.fileToUpload.fileExtension)
      .subscribe(response => {
      this.loading = false;
      let cropResponse = null;
      if (response.status === 200) {
        // send back the chosen image in payload, so parent can update view
        const payload = [];
        const img = this.imageDestination.split(',');
        payload.push(img[1]);
        cropResponse = new CustomResponse(200, payload);
      } else if (response.status === 401) {
        // display msg unauthorized access
        alert('401 Unauthorized access. You do not have permission to change this data.');
        console.error(response);
        cropResponse = new CustomResponse(401, null);
      } else  if (response.status === 599) {
        alert('Sorry the image file exceeds the 5MB max file size.');
        console.error(response);
        cropResponse = new CustomResponse(500, null);
      } else {
        alert('Sorry there was an error uploading the image.');
        console.error(response);
        cropResponse = new CustomResponse(500, null);
      }
      this.matDialogRef.close(cropResponse);
    }));

  }

  /**
   * Dismiss the dialog, trash any image data
   */
  cancel() {
    this.previewImgSrc = null;
    this.imageReady = false;
    this.fileToUpload = null;
    this.matDialogRef.close();
  }

  initializeCropper() {
    this.cropper = new Cropper(this.imageElement.nativeElement, {
      zoomable: false,
      scalable: false,
      aspectRatio: 4 / 5,
      crop: () => {
      const canvas = this.cropper.getCroppedCanvas(
        {imageSmoothingQuality : 'high'}
      );
      this.imageDestination = canvas.toDataURL('image/png');
      }
      });
    this.initialized = true;
  }

  /**
   * File was selected by user. Read the image and set the preview src for it. Add the file to the upload variable
   * @param event File select event containing the chosen file
   */
  onFileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      const imageFile = event.target.files[0];
      const extension = imageFile.name.split('.').pop();
      const reader = new FileReader();
      reader.onload = e => {
        this.imageSource = reader.result;
        this.imageReady = true;
        this.fileToUpload = {
          fileName: imageFile.name,
          fileType: imageFile.type,
          fileExtension: extension,
          value: reader.result
        };
        if (this.initialized) {
          this.cropper.replace(this.imageSource.toString());
        } else {
          this.initializeCropper();
        }
      };
      if (imageFile.size <= this.MAXFILESIZE) {
        if (this.suportedFiles.includes(imageFile.type)) {
          reader.readAsDataURL(imageFile);
        } else {
          alert('Sorry this is not a valid file type' + (imageFile.type));
        }
      } else {
        alert('Sorry this file exceeds the maximum size of 5MB.');
      }
    }
  }

}
