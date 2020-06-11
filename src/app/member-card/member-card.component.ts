import { Component, OnInit, Inject} from '@angular/core';
import { Member } from '../models/Member';
import { MatDialogRef, MAT_DIALOG_DATA  } from '@angular/material/dialog';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})

/**
 * Shared component. Dropdown of player information shared on some screens of app.
 */
export class MemberCardComponent implements OnInit {

  constructor(
      public dialogRef: MatDialogRef<MemberCardComponent>,
      @Inject(MAT_DIALOG_DATA) public memberData: Member
    ) { }


  ngOnInit() {

  }

  close() {
    this.dialogRef.close();
  }


}
