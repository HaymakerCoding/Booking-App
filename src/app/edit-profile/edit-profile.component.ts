import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Member } from '../models/Member';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { MemberService } from '../services/member.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, OnDestroy {

  form;
  user: Member;
  subscriptions: Subscription[] = [];

  constructor(
    private userService: UserService,
    private memberService: MemberService,
    private matDialog: MatDialog
  ) { }

  ngOnInit() {
    this.getUserData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * Get the member/user data from the database
   */
  getUserData() {
    this.userService.getUserInfo().subscribe(response => {
      if (response.status === '200') {
        this.user = response.payload[0];
        this.getUserImage();
      } else {
        alert ('Sorry there was an error fetching user data from the database.');
        console.error(response.status);
      }
    });
  }

  /**
   * Grab the user's avatar image from the s3 bucket
   */
  getUserImage() {
    this.subscriptions.push(this.memberService.getMemberPic(this.user.id.toString()).subscribe(response => {
      if (response.status === '200') {
        this.user.pic = response.payload[0];
      }
      this.setupForm();
    }));
  }

  /**
   * Setup the HTML form object. Supplying data from User.
   */
  setupForm() {
    this.form = new FormGroup({
      firstName: new FormControl(this.user.firstName, Validators.required),
      lastName: new FormControl(this.user.lastName, Validators.required),
      gender: new FormControl(this.user.membersex),
      birth: new FormControl(this.user.memberbirthdate),
      rounds: new FormControl(this.user.memberRoundsPerYear),
      avgScore: new FormControl(this.user.memberAverageScore),
      email: new FormControl(this.user.email, Validators.compose([Validators.required, Validators.email])),
      altEmail: new FormControl(this.user.altEmail, Validators.email),
      homePhone: new FormControl(this.user.homePhone),
      cellPhone: new FormControl(this.user.cellPhone),
      address: new FormControl(this.user.address),
      city: new FormControl(this.user.city),
      province: new FormControl(this.user.province),
      postal: new FormControl(this.user.postal),
      competitionPref: new FormControl(this.user.competitionPref),
      daysAbleToPlay: new FormControl(this.user.daysAbleToPlay)

    });
  }

  save(data) {
    alert('wip');
  }

  /**
   * Open a dialog which handles the croppping and saving of the user's avatar
   * Then Subscribe and wait for the close event. If 200 response then update the in memory user avatar
   */
  showImgUpload() {
    const dialogRef = this.matDialog.open(ImageCropperComponent);

    this.subscriptions.push(dialogRef.afterClosed().subscribe(response => {
      if (response && response.status === 200) {
        this.user.pic = response.payload;
      } else {
        console.log(response);
      }
    }));
  }


}
