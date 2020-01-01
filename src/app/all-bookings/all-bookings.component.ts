import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { Booking } from '../models/Booking';
import { BookingService } from '../services/booking.service';
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Member } from '../models/Member';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChronoGolfService } from '../services/chronoGolf.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-all-bookings',
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.css']
})
export class AllBookingsComponent implements OnInit, OnDestroy, AfterViewInit {

  tableColumns: string[] = ['date', 'course', 'bookedBy', 'bookedFor', 'playFee', 'teeTime', 'cancel'];

  @ViewChild('reservationDialog', { static: true }) reservationDialog: TemplateRef<any>;

  bookings: Booking[] = [];
  masterBookings: Booking[] = [];

  yearOptions: number[] = [];
  yearSelected: number;

  loggedUser: Member;

  dataSource;

  currentDialogRef: MatDialogRef<any>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  subscriptions: Subscription[] = [];

  loading: boolean;

  viewBookedBy: string; // used to filter either show all or just booked by user for user

  dialogRef: MatDialogRef<any>;

  constructor(
    private bookingService: BookingService,
    private userService: UserService,
    private router: Router,
    private snackbar: MatSnackBar,
    private chronoGolfService: ChronoGolfService,
    private matDialog: MatDialog
  ) { }

  ngOnInit() {
    this.loading = true;
    this.yearSelected = new Date().getFullYear();
    this.viewBookedBy = 'all';
    const url = this.router.url;
    if (url === '/Book/All/200') {
      this.snackbar.open('Booking Successful. Thanks for booking!', '', { duration: 3000 });
    }
  }

  ngAfterViewInit() {
    this.getBookings(this.yearSelected);
  }

  /**
   * Get the member/user data from the database
   */
  getUserData() {
    this.loading = true;
    this.userService.getUserInfo().subscribe(response => {
      if (response.status === '200') {
        this.loggedUser = response.payload[0];
        this.loading = false;
      } else {
        alert ('Sorry there was an error fetching user data from the database.');
        console.error(response.status);
      }
      this.loading = false;
    });
  }

  filterBookings() {
    if (this.viewBookedBy === 'all') {
      // change to view only bookings by the user for the user
      this.viewBookedBy = 'me';
      this.bookings = this.masterBookings.filter(x => x.bookedBy === this.loggedUser.memberNumber &&
         x.bookedFor === this.loggedUser.memberNumber);
      this.dataSource = new MatTableDataSource(this.bookings);
      this.dataSource.paginator = this.paginator;
    } else {
      // change to view all bookings
      this.viewBookedBy = 'all';
      this.bookings = this.masterBookings;
      this.dataSource = this.bookings;
      this.dataSource.paginator = this.paginator;
    }
  }

  /**
   * Get the users booking reservations. Gets called each time year selector changes as well as on init.
   * @param year 4 digit year for selecting bookings for
   */
  getBookings(year) {
    this.subscriptions.push(this.bookingService.getAllBookings(year).subscribe(response => {
      if (response.status === '200') {
        this.bookings = response.payload;
        this.masterBookings = this.bookings;
        this.dataSource = new MatTableDataSource(this.bookings);
        this.dataSource.paginator = this.paginator;
        this.formatDates();
      } else {
        alert('Sorry there was a problem with the database.');
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
    this.setYearOptions();
  }

  setYearOptions() {
    for (let x = this.yearSelected; x > 2004; x-- ) {
      this.yearOptions.push(x);
    }
    this.getUserData();
  }

  cancelDialogClosed(answer: string, id: number | null) {
    this.currentDialogRef.close();
    if (answer === 'yes') {
      this.subscriptions.push(this.bookingService.cancel(id).subscribe(response => {
        if (response === 200) {
          this.snackbar.open('Your booking was cancelled.', '', { duration: 3000 });
          this.bookings.find(x => x.id === id).cancelled = 'Yes';
        } else {
          alert('Sorry there was an error cancelling this booking. Please contact ClubEG or try again layer.');
          console.error(response);
        }
      }));
    }
  }

  checkCancellableDate(date) {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const today = new Date(new Date().setDate(new Date().getDate()) - tzoffset).toJSON().slice(0, 10);
    if (date >= today) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Show the confirmation dialog for cancelling the booking
   * @param id ID of the booking for OUR record
   * @param templateRef Template reference, needed to define mat dialog content
   * @param booking Booking we are looking to cancel
   */
  cancel(bookId: number, templateRef: any, booking: Booking) {
    this.currentDialogRef = this.matDialog.open(templateRef, { data: { data: booking, id: bookId  }});
  }

  /**
   * Fetch the tee time that was reserved on the external api system for the booking.
   * Display in dialog
   * @param reservationId Tee Time reservation ID for external api
   */
  showTeeTime(reservationId, courseName: string) {
    this.subscriptions.push(this.chronoGolfService.getReservation(reservationId).subscribe(response => {
      if (response.status === '200') {
        console.log(response.payload);
        this.dialogRef = this.matDialog.open(this.reservationDialog, {
          data: {
            data: response.payload,
            course: courseName
          }
        });
      } else {
        alert('Sorry there was a problem getting the tee time reservation. Try back later or contact ClubEG.');
        console.error(response);
      }
    }));
  }

  /**
   * Close a dialog
   */
  closeDialog() {
    this.dialogRef.close();
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
