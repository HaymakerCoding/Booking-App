import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminService } from '../services/admin.service';
import { Announcement } from '../models/Announcement';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  announcement: Announcement;
  loading: boolean;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getAnnouncement();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  getAnnouncement() {
    this.subscriptions.push(this.adminService.getAnnouncement().subscribe(response => {
      if (response.status === '200') {
        this.announcement = response.payload[0];
        this.loading = false;
      } else {
        alert('Error fetching announcement data');
        console.error(response.status);
      }
    }));
  }

  saveAnnoucement(text) {
    this.subscriptions.push(this.adminService.updateAnnoucement(text).subscribe(response => {
      if (response.status === '200') {
        const snackbarRef = this.snackBar.open('Annoucement update successful!', '', { duration: 3000});
      } else {
        alert('There was an error updating  the announcement');
        console.error(response.status);
      }
    }));
  }



}
