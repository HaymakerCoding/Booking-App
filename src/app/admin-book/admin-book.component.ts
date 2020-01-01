import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, ModalDismissReasons, NgbModalConfig,
  NgbDatepicker, NgbDateStruct, NgbCalendar , NgbDate} from '@ng-bootstrap/ng-bootstrap';
import { TeeTime } from '../models/TeeTime';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Booking } from '../models/Booking';
import { AdminService } from '../services/admin.service';
import { Subscription } from 'rxjs';

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

  @ViewChild('teeTimeModal', {static: false}) private teeTimeModal: NgbModal;
  private teeModalRef: NgbModalRef;
  private dateModal: NgbDatepicker;

  form: FormGroup;

  courseId: number;
  date: string;

  closeResult: string;

  spotsNeeded: number;
  teeTimes: TeeTime[];

  model: NgbDateStruct;

  subscriptions: Subscription[] = [];

  constructor(
    private calendar: NgbCalendar,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      course: new FormControl('0', Validators.compose([Validators.min(1), Validators.required])),
      eventName: new FormControl(''),
      numPlayers: new FormControl(1, Validators.required),
      date: new FormControl(''),
      comments: new FormControl('')
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  isDisabled = (date: NgbDate, current: {month: number}) => !this.checkDate(date);
  isBookable = (date: NgbDate) => this.checkDate(date);

  /**
   * Used to check dates in datepicker and allow booking of those in specific range. Also applies bkg color
   * @param date Ngb date object
   */
  checkDate(date: NgbDate) {
    const t = new Date();
    const today = new NgbDate(t.getFullYear(), t.getMonth() + 1, t.getDate());
    const maxDate = new NgbDate(t.getFullYear(), t.getMonth() + 1, t.getDate() + 7);
    // alert(JSON.stringify(today));
    if (date.equals(today) || ( date.before(maxDate)) && date.after(today) ) {
      return true;
    }
  }

  openModal() {
    this.spotsNeeded = this.form.get('numPlayers').value;
    // get todays date, and date 7 days from now for controlling range of date selection
    const today = new Date().toISOString().slice(0, 10);
    const temp = new Date();
    const maxDate = temp.setDate(temp.getDate() + 6);
    const maxDateString = new Date(maxDate).toISOString().slice(0, 10);

    if (this.date === '' || !this.date) {
      alert('Please choose a date first');
    } else if (this.form.get('course').value === '0') {
      alert('Please choose a course first');
    } else if (this.form.get('numPlayers').value < 1) {
      alert('Please enter at least 1 player');
    } else if (this.date < today || this.date > maxDateString) {
      alert('Invalid date. You must choose a date that is not in the past and no more than 7 days in advance.');
    } else {
      this.courseId = this.form.get('course').value;
      this.teeModalRef = this.modalService.open(this.teeTimeModal, { size: 'lg', backdrop: 'static' });
      this.teeModalRef.result.then((result) => {
        // modal closed
      }, (reason) => {
        // modal dismissed
      });
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  /**
   * Fires on every select/change of the datepicker. Set the current date. Erase any tee times as they are dependant on date.
   * @param event Event containing date object
   */
  onDateSelect(event) {
    this.teeTimes = [];
    this.date = (event.year + '-' + event.month + '-' + event.day);
  }

  /**
   * Fired when tee times are returned from the child component 'tee-times'. Supplies us the user selected tee times.
   * @param teeTimes Array of tee times
   */
  teeTimesSelected(teeTimes) {
    this.teeTimes = [];
    this.teeTimes = teeTimes;
    this.teeModalRef.close();
  }

  /**
   * Send the booking data and tee times to the database.
   * Booking data is saved on our database.
   * Tee time IDs are used to reserve tee times with the partner API.
   * Then reservation IDs are stored in our database linked to the booking record.
   * @param formData Form field data
   */
  submitForm(formData) {
    const booking = new Booking(
      null, // new entry so database will provide
      this.form.get('course').value,
      null, // course Name is null here as we don't store in db
      this.date,
      null, // just for display purposes, not db
      this.form.get('eventName').value,
      this.form.get('comments').value,
      null, // update time will be provided on server
      null, // user id will be provided on server
      null, // member name not stored in booking record
      this.form.get('numPlayers').value, null, null, null, 'No', null, null, null, null
    );
    this.subscriptions.push(this.adminService.addBooking(booking, this.teeTimes).subscribe(response => {
      alert('Booking saved....But error booking with Chronogolf. WIP');
      console.log(response.status);
    }));
  }

}
