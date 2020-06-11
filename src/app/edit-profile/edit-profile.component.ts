import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { Member } from '../models/Member';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { MemberService } from '../services/member.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, OnDestroy {

  form: FormGroup;
  user: Member;
  subscriptions: Subscription[] = [];

  unsavedChanges: boolean;

  matcher: ErrorStateMatcher;

  provinces: Province [] = [];

  constructor(
    private userService: UserService,
    private memberService: MemberService,
    private matDialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.matcher = new MyErrorStateMatcher();
    this.unsavedChanges = false;
    this.initProvinces();
    this.getUserData();
  }

  /**
   * If the cell phone or home phone are set then change their format to display format
   */
  formatPhoneNumbers() {
    if (this.user.homePhone) {
      this.user.homePhone = this.formatPhone(this.user.homePhone, null);
    }
    if (this.user.cellPhone) {
      this.user.cellPhone = this.formatPhone(this.user.cellPhone, null);
    }
  }

  /**
   * Setup the Provinces in an array so we can set the text and value in elements, code is database storage value
   */
  initProvinces() {
    const ab: Province = { code: 'AB', name: 'Alberta' };
    const bc: Province = { code: 'BC', name: 'British Columbia' };
    const mb: Province = { code: 'MB', name: 'Manitoba' };
    const nb: Province = { code: 'NB', name: 'New Brunswick' };
    const nl: Province = { code: 'NL', name: 'Newfoundland and Labrador' };
    const ns: Province = { code: 'NS', name: 'Nova Scotia' };
    const on: Province = { code: 'ON', name: 'Ontario '};
    const pe: Province = { code: 'PE', name: 'Prince Edward Island' };
    const qc: Province = { code: 'QC', name: 'Quebec' };
    const sk: Province = { code: 'SK', name: 'Saskatchewan' };
    const nt: Province = { code: 'NT', name: 'Northwest Territories' };
    const nu: Province = { code: 'NU', name: 'Nunavut' };
    const yt: Province = { code: 'YT', name: 'Yukon' };

    this.provinces.push(ab, bc, mb, nb, nl, ns, on, pe, qc, sk, nt, nu, yt);
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
      this.formatPhoneNumbers();
      this.setupForm();
    }));
  }

  /**
   * Change user entered phone number into a nice display format
   * This function can be used as unviersal function to return a formatted date by not providing a control
   * @param phone Phone number
   * @param controlName Optional form control name
   */
  formatPhone(phone: string, controlName: string) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      const formatted = '(' + match[1] + ') ' + match[2] + '-' + match[3];
      if (controlName) {
        this.form.get(controlName).setValue(formatted);
      } else {
        return formatted;
      }
    } else {
      if (controlName) {
        this.form.get(controlName).setErrors({ incorrect: true });
      } else {
        return null;
      }
    }
  }

  /**
   * Remove formating from the phone number so its just numbers for database storage
   * @param phone Phone number
   */
  deFormatPhone(phone: string): string {
    return phone.replace('(', '').replace(')', '').replace('-', '').replace(' ', '');
  }

  /**
   * Setup the Form Group and Validators. Supplying data from User.
   */
  setupForm() {
    this.form = new FormGroup({
      firstName: new FormControl(this.user.firstName, Validators.required),
      lastName: new FormControl(this.user.lastName, Validators.required),
      gender: new FormControl(this.user.membersex, Validators.maxLength(1)),
      birth: new FormControl(this.getBirthDefault(this.user.memberbirthdate), Validators.compose(
        [Validators.maxLength(4), Validators.pattern('[0-9]*'), Validators.minLength(4)]
      )),
      rounds: new FormControl(this.user.memberRoundsPerYear, Validators.compose([Validators.maxLength(4), Validators.pattern('[0-9]*')])),
      avgScore: new FormControl(this.user.memberAverageScore, Validators.compose([Validators.maxLength(3), Validators.pattern('[0-9]*')])),
      email: new FormControl(this.user.email, Validators.compose([Validators.required, Validators.email, Validators.maxLength(100)])),
      altEmail: new FormControl(this.user.altEmail, Validators.compose([Validators.email, Validators.maxLength(100)])),
      homePhone: new FormControl(this.user.homePhone),
      cellPhone: new FormControl(this.user.cellPhone),
      address: new FormControl(this.user.address, Validators.maxLength(100)),
      city: new FormControl(this.user.city, Validators.maxLength(50)),
      province: new FormControl(this.user.province, Validators.maxLength(50)),
      postal: new FormControl(this.user.postal, Validators.compose([Validators.maxLength(6), Validators.minLength(6)])),
      competitionPref: new FormControl(this.user.competitionPref, Validators.maxLength(30)),
      daysAbleToPlay: new FormControl(this.user.daysAbleToPlay, Validators.maxLength(500))

    });
  }

  /**
   * Check for a Zero value for birth year and return null if so.
   * @param birthYear User's birth year from db
   */
  getBirthDefault(birthYear) {
    return birthYear === 0 || birthYear === '0' ? null : birthYear;
  }

  /**
   * On click of save button we send all form data to the datbase to update properties of User/Member
   * @param formData Form Data holding user values
   */
  save(formData) {
    // remove display formatting from the 2 phone numbers so we are left with just a string of numbers for database storage
    formData.homePhone = this.deFormatPhone(formData.homePhone);
    formData.cellPhone = this.deFormatPhone(formData.cellPhone);
    this.subscriptions.push(this.userService.updateUser(formData).subscribe(response => {
      if (response.status === 200) {
        this.snackbar.open('Profile updated.', '', {duration: 3000});
        this.unsavedChanges = false;
      } else {
        alert('Sorry there was a problem updating your profile.');
        console.error(response);
      }
    }));
  }

  /**
   * Display a notice about unsaved changes to the form.
   */
  toggleUnsaved() {
    if (this.unsavedChanges === false) {
      this.unsavedChanges = true;
    }
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

interface Province {
  name: string;
  code: string;
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
