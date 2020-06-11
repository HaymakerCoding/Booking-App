import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA  } from '@angular/material/dialog';
import { Member } from '../models/Member';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public memberData: Member,
    private router: Router
  ) { }

  ngOnInit() {
    this.formatPhoneNumbers();
  }

  /**
   * If the cell phone or home phone are set then change their format to display format
   */
  formatPhoneNumbers() {
    if (this.memberData.homePhone) {
      this.memberData.homePhone = this.formatPhone(this.memberData.homePhone);
    }
    if (this.memberData.cellPhone) {
      this.memberData.cellPhone = this.formatPhone(this.memberData.cellPhone);
    }
  }

  goToEdit() {
    this.dialogRef.close();
    this.router.navigate(['User/Edit']);
  }

  close() {
    this.dialogRef.close();
  }

  /**
   * Change user entered phone number into a nice display format
   * @param phone Phone number
   */
  formatPhone(phone: string) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      const formatted = '(' + match[1] + ') ' + match[2] + '-' + match[3];
      return formatted;
    } else {
      return null;
    }
  }

}
