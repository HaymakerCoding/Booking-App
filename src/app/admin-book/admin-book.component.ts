import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TeeTime } from '../models/TeeTime';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AdminService } from '../services/admin.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TeeTimesComponent } from '../tee-times/tee-times.component';
import { AdminBooking } from '../models/AdminBooking';
import { DatePipe } from '@angular/common';
import { ChronoGolfService } from '../services/chronoGolf.service';

@Component({
  selector: 'app-admin-book',
  templateUrl: './admin-book.component.html',
  styleUrls: ['./admin-book.component.css'],
  styles: [`
    .custom-day {
      text-align: center;
      padding: 0.185rem 0.25rem;
      border-radius: 0.25rem;
      display: inline-block;
      width: 2rem;
    }
    .custom-day:hover, .custom-day.focused {
      background-color: #e6e6e6;
    }
    .bookable {
      background-color: #f0ad4e;
      border-radius: 1rem;
      color: white;
    }
    .hidden {
      display: none;
    }
  `]
})
export class AdminBookComponent implements OnInit, OnDestroy {

  formIndividual: FormGroup;
  formGroup: FormGroup;

  courseId: number;
  date: string;

  closeResult: string;

  spotsNeeded: number;

  courses: Course[] = [];
  nums100: number[] = [];

  selectedTeeTimes: TeeTime[];

  subscriptions: Subscription[] = [];
  matDialogRef: MatDialogRef<any>;

  constructor(
    private snackbar: MatSnackBar,
    private matDialog: MatDialog,
    private adminService: AdminService,
    private datePipe: DatePipe,
    private chronoService: ChronoGolfService
  ) { }

  ngOnInit() {
    for (let x = 1; x < 100; x++) {
      this.nums100.push(x);
    }
    this.initForms();
    this.initCourses();
  }

  /**
   * Initialize an array of courses the admin user can select tee times from
   */
  initCourses() {
    this.courses.push({
      id: 68,
      name: 'Pine View',
      partnerApiCourseId: null
    });
  }

  /**
   * Initialize the controls for the forms and set their Validators
   */
  initForms() {
    this.formGroup = new FormGroup({
      course: new FormControl('', Validators.compose([Validators.min(1), Validators.required])),
      eventName: new FormControl(''),
      numPlayers: new FormControl(1, Validators.required),
      date: new FormControl(''),
      comments: new FormControl('')
    });
    this.formIndividual = new FormGroup({
      course: new FormControl('', Validators.compose([Validators.min(1), Validators.required])),
      date: new FormControl(''),
      comments: new FormControl(''),
      teeTime: new FormControl(''),
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }


  /**
   * Open a Dialog which contacts the external partner API to request tee times for the date/course provided.
   * Tee times are shown in the dialog and once a user selects desired results are passed back to this component.
   * @param type Type of Form Group or Indiv
   */
  openTeeTimeDialog(type: string) {
    let form: FormGroup = null;
    let numPlayers = null;
    type === 'indiv' ? form = this.formIndividual : form = this.formGroup;
    type === 'indiv' ? numPlayers = 1 : numPlayers = form.get('numPlayers').value;
    const courseId = form.get('course').value;
    const date: OurDate = this.getDate(form.get('date').value);
    const today = new Date();
    if (courseId === '') {
      alert('Please choose a course first');
    } else if (date.mysql === '' || date.mysql === null) {
      alert('Please choose a date first');
    } else if (this.getDate(today).mysql > date.mysql) { // check if date selected is not less than date today
      alert('Error: Date entered cannot be in the past.');
    } else {
      this.matDialogRef = this.matDialog.open(TeeTimesComponent, {
        data: {
          courseId,
          courseName: this.courses.find(x => x.id === courseId).name,
          date: date.mysql,
          displayDate: date.displayDate,
          numPlayers
        }
      });
      this.subscriptions.push(this.matDialogRef.afterClosed().subscribe(response => {
        // check if there is at least 1 id returned, indicates successfully returned tee time(s)
        if (response.teeTimes[0].id) {
          if (type === 'indiv') {
            this.selectedTeeTimes = [];
            this.selectedTeeTimes.push(response.teeTimes[0]);
            form.get('teeTime').setValue(this.selectedTeeTimes[0].startTime);
          } else {
            this.selectedTeeTimes = response.teeTimes;
          }
        } else {
          alert('Sorry there was an error getting the tee times');
        }
      }));
    }
  }

  /**
   * Transform a JavaScript Date into our own Date obj holding both a mysql and formatted version
   * @param d Date
   */
  getDate(d): OurDate {
    const tzoffset = (d).getTimezoneOffset() * 60000;
    const mysqlDate = new Date(d - tzoffset).toJSON().slice(0, 10);
    const weekday = this.getDayText(d.getDay());
    const month = this.getMonthText(d.getMonth());
    const day = d.getDate();
    const displayDate = weekday + ' ' + month + ' ' + day;
    const ourDate: OurDate = {
      mysql: mysqlDate,
      displayDate
    };
    return ourDate;
  }

  /**
   * Change the Java Date day number for text
   * @param num number representing day from Java Date
   */
  getDayText(num: number) {
    switch (num) {
    case 0 : return 'Sun';
    case 1 : return 'Mon';
    case 2 : return 'Tue';
    case 3 : return 'Wed';
    case 4 : return 'Thu';
    case 5 : return 'Fri';
    case 6 : return 'Sat';
    }
  }

  /**
   * Change the Java Date month number for text
   * @param num number representing month from Java Date
   */
  getMonthText(num: number) {
    switch (num) {
    case 0 : return 'January';
    case 1 : return 'February';
    case 2 : return 'March';
    case 3 : return 'April';
    case 4 : return 'May';
    case 5 : return 'June';
    case 6 : return 'July';
    case 7 : return 'August';
    case 8 : return 'September';
    case 9 : return 'October';
    case 10 : return 'November';
    case 11 : return 'December';
    }
  }

  /**
   * Fires on every select/change of the datepicker. Set the current date. Erase any tee times as they are dependant on date.
   * @param event Event containing date object
   */
  onDateChange() {
    this.selectedTeeTimes = [];
    this.formIndividual.get('teeTime').setValue(null);
  }

  /**
   * Send the booking data and tee times to the database.
   * Booking data is saved on our database.
   * Tee time IDs are used to reserve tee times with the partner API.
   * Then reservation IDs are stored in our database linked to the booking record.
   * @param formData Form field data
   */
  submitForm(formData, type: string) {
    const booking = new AdminBooking(
      null,
      formData.course,
      null,
      formData.date,
      null,
      formData.comments,
      formData.eventName,
      null,
      null,
      null
    );
    console.log(this.selectedTeeTimes);
    // format the date to Mysql format for db
    booking.dateFor = this.datePipe.transform(booking.dateFor, 'yyyy-MM-dd');
    this.getReservationIds(this.selectedTeeTimes, formData.course, booking);

  }

  /**
   * Final Step in booking, send the booking data and reservation Ids to the database to persist
   * @param reservationIds External API reservation Ids for tee times booked with them
   * @param booking Our booking record, parent record to the reservation ids
   */
  saveBooking(reservationIds: number[], booking) {
    if (reservationIds.length < 1) {
      alert('Sorry something went wrong with creating the reservations with Chronogolf');
    } else {
      this.subscriptions.push(this.adminService.addBooking(booking, reservationIds).subscribe(response => {
        if (response.status === 201) {
          this.snackbar.open('Booking Created!', '', { duration: 3000 });
          this.formIndividual.reset();
          this.formGroup.reset();
        } else {
          console.error(response);
          alert('Sorry there was a problem saving the booking');
        }
      }));
    }
  }

  /**
   * Use the tee times Ids to create reservations with the external partner api and return the reservation Ids
   */
  getReservationIds(selectedTeeTimes: TeeTime[], courseId, booking) {
    const reservationIds = [];
    selectedTeeTimes.forEach(x => {
      this.subscriptions.push(this.chronoService.addReservation(x.id, 18, courseId ).subscribe(response => {
        console.log(response);
        if (response.status === 201) {
          // reservation was created, payload contains the reservation ID we need to save in our db
          reservationIds.push(response.payload);
        } else {
          console.error(response);
        }
        if (reservationIds.length === selectedTeeTimes.length) {
          this.saveBooking(reservationIds, booking);
        }
      }));
    });

  }

}



/**
 * Obj for holding the id and name of course to book tee times for
 */
interface Course {
  id: number;
  name: string;
  partnerApiCourseId: number; // different ID used by external api system to identify the course
}

/**
 * A Custom date object holding properties for a mysql formatted date for database and a display version
 */
interface OurDate {
  mysql: any;
  displayDate: string;
}
