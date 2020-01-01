import { Component, OnInit, OnDestroy} from '@angular/core';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Member } from '../models/Member';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})

/**
 * Shared component. Dropdown of player information shared on some screens of app.
 */
export class MemberCardComponent implements OnInit, OnDestroy {

  loggedUser: Member;
  today: Date;
  userPicSrc: any;

  loading: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<MemberCardComponent>,
    private userService: UserService) { }


  ngOnInit() {
    this.loading = false;
    this.today = new Date();
    this.getUserData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  close() {
    this.dialogRef.close();
  }

  /**
   * Get the member/user data from the database
   */
  getUserData() {
    this.loading = true;
    this.userService.getUserInfo().subscribe(response => {
      if (response.status === '200') {
        this.loggedUser = response.payload[0];
        if (this.loggedUser.pic !== null) {
          // setup image src
          const base64Flag = 'data:image/jpeg;base64,';
          const imageStr = this.loggedUser.pic;
          this.userPicSrc = base64Flag + imageStr;
          this.loading = false;
        } else {
          this.loading = false;
        }
      } else {
        alert ('Sorry there was an error fetching user data from the database.');
        console.error(response.status);
      }
    });
  }


}
