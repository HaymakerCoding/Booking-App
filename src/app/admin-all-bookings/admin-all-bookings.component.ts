import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminService } from '../services/admin.service';
import { AdminBooking } from '../models/AdminBooking';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChronoGolfService } from '../services/chronoGolf.service';

@Component({
  selector: 'app-admin-all-bookings',
  templateUrl: './admin-all-bookings.component.html',
  styleUrls: ['./admin-all-bookings.component.css']
})
export class AdminAllBookingsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];
  bookings: AdminBooking[];
  matDialogRef: MatDialogRef<any>;
  selectedCourse: string;
  selectedDate: any;

  loading: boolean;

  constructor(
    private adminService: AdminService,
    private matDialog: MatDialog,
    private chronoService: ChronoGolfService
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getAllBookings();
  }

  /**
   * Get all booking records from the db
   */
  getAllBookings() {
    this.subscriptions.push(this.adminService.getAllBookings(2019).subscribe(response => {
      if (response.status === 200) {
        this.bookings = response.payload;
        this.formatDates();
      } else {
        alert('There was an error loading bookings');
        console.error(response);
      }
    }));
  }

  /**
   * Go through all reservation ids in an admin booking and contact the external api to pull the tee time data for each
   * @param teeTimeModal Reference to template ref holding dialog
   * @param booking Admin Booking
   */
  getTeemTimeInfo(teeTimeModal: TemplateRef<any>, booking: AdminBooking) {
    this.selectedCourse = booking.courseName;
    this.selectedDate = booking.dateFor;
    const teeTimeData = [];
    booking.reservationIds.forEach(id => {
      this.subscriptions.push(this.chronoService.getReservation(id).subscribe(response => {
        if (response.status === '200') {
          teeTimeData.push(response.payload);
          if (teeTimeData.length === booking.reservationIds.length) {
            // got data for all reservation ids, now open the dialog
            this.openTeeTimeModal(teeTimeModal, teeTimeData);
          }
        } else {
          alert('Sorry there was a problem getting the tee time reservation. Try back later or contact ClubEG.');
          console.error(response);
        }
      }));
    });
  }

  /**
   * Open the dialog passing in the tee time data
   * @param teeTimeModal Template Ref holding the mat dialog
   * @param teeTimeData Tee Time data
   */
  openTeeTimeModal(teeTimeModal: TemplateRef<any>, teeTimeData: any[]) {
    this.matDialogRef = this.matDialog.open(teeTimeModal, { data: teeTimeData, minWidth: 400 });
  }

  /**
   * Format the date to display without leading zeros and with am/pm and 12 hour format
   * @param time Time to format
   */
  formatTime(time) {
    const bits = time.split(':');
    const hour = bits[0];
    const minutes = bits[1];
    const amPm = time >= 12 ? 'pm' : 'am';
    const finalHour = (hour % 12) || 12;
    return (hour + ':' + minutes + amPm).replace(/^0+/, '');
  }

  close() {
    this.matDialogRef.close();
  }

  /**
   * Change our MySQL dates to a nice display format
   */
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
      x.dateFor = strDate;
    });
    this.loading = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
