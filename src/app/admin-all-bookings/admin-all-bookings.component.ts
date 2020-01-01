import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Booking } from '../models/Booking';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-all-bookings',
  templateUrl: './admin-all-bookings.component.html',
  styleUrls: ['./admin-all-bookings.component.css']
})
export class AdminAllBookingsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  bookings: Booking[];

  loading: boolean;

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loading = true;
    this.getAllBookings();
  }

  /**
   * Get all booking records from the db
   */
  getAllBookings() {
    this.subscriptions.push(this.adminService.getAllBookings(2019).subscribe(response => {
      if (response.status === '200') {
        this.bookings = response.payload;
        this.formatDates();
      } else {
        alert('There was an error loading bookings');
        console.error(response.status);
      }
    }));
  }

  formatDates() {
    this.bookings.forEach(x => {
      const d = new Date(x.dateFor);
                // change timezone, needed for proper display
      d.setTime(d.getTime() + d.getTimezoneOffset() * 60 * 1000);
      const strDate =
        d.toLocaleString('en-us', { weekday: 'short'  }) + ' ' +
        d.toLocaleString('en-us', { month: 'short'  }) + ' ' +
        d.toLocaleString('en-us', { day: 'numeric' }) + ', ' +
        d.toLocaleString('en-us', { year: 'numeric'});
      x.displayDate = strDate;
    });
    this.loading = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
