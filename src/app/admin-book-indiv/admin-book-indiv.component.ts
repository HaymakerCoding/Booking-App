import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef, ModalDismissReasons, NgbModalConfig,
  NgbDatepicker, NgbDateStruct, NgbCalendar , NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { TeeTime } from '../models/TeeTime';
import { MemberService } from '../services/member.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-book-indiv',
  templateUrl: './admin-book-indiv.component.html',
  styleUrls: ['./admin-book-indiv.component.css'],
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
export class AdminBookIndivComponent implements OnInit, OnDestroy {

  @ViewChild('teeTimeModal', {static: false}) private teeTimeModal: NgbModal;
  private teeModalRef: NgbModalRef;
  @ViewChild('memberModal', { static: false}) private memberModal: NgbModal;
  private memberModalRef: NgbModalRef;

  form: FormGroup;

  courseId: number;
  date: string;

  closeResult: string;

  spotsNeeded: number;
  teeTimes: TeeTime[];

  masterMemberList: any[];
  memberList: any[];

  members: BasicMember[] = [];

  // member ID of the member who is the main contact for the booking
  mainContact: number;

  loading: boolean;

  subscriptions: Subscription[] = [];

  constructor(
    private modalService: NgbModal,
    private memberService: MemberService,
    config: NgbModalConfig
  ) { }

  ngOnInit() {
    this.loading = true;
    this.form = new FormGroup({
      course: new FormControl('0', Validators.compose([Validators.min(1), Validators.required])),
      date: new FormControl('')
    });
    this.getAllMembers();
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

  getAllMembers() {
    this.subscriptions.push(this.memberService.getAllMembers().subscribe(response => {
      this.masterMemberList = response.payload;
      this.loading = false;
    }));
  }

  openModal() {
      // get todays date, and date 7 days from now for controlling range of date selection
      const today = new Date().toISOString().slice(0, 10);
      const temp = new Date();
      const maxDate = temp.setDate(temp.getDate() + 6);
      const maxDateString = new Date(maxDate).toISOString().slice(0, 10);

      if (this.members.length < 1) {
        alert('Must have at least 1 member selected to get a Tee Time.');
      } else if (!this.date) {
        alert('Please choose a date first');
      } else if (this.form.get('course').value === '0') {
        alert('Please choose a course first');
      } else if (this.date < today || this.date > maxDateString) {
        alert('Invalid date. You must choose a date that is not in the past and no more than 7 days in advance.');
      } else {
        this.spotsNeeded = this.members.length;
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
   * Add a Member's basic data to the member list for this booking
   * @param fullName Members first and last name
   * @param memberId Primary ID for the member
   */
  addMember(fullName: string, memberId: number, memberNumber: number) {
    const member = new BasicMember(memberId, fullName, memberNumber);
    this.members.push(member);
    if (!this.mainContact) {
      this.mainContact = memberId;
    }
    this.memberModalRef.close();
  }

  /**
   * Remove a member from this booking
   * @param memberId Members main ID
   */
  removeMember(memberId) {
    this.members = this.members.filter(x => x.id !== memberId);
    // if this member was the main contact we need to clear them
    if (this.mainContact === memberId) {
      this.mainContact = null;
    }
  }

  /**
   * Change who the main contact is for this golf booking
   * @param memberId Primary ID of the member
   */
  changeMainContact(memberId) {
    this.mainContact = memberId;
  }

  searchMembers(name) {
    this.memberList = this.masterMemberList.filter(x => x.fullName.toLowerCase().startsWith(name.toLowerCase()));
  }

  openMemberModal(target) {
    target.preventDefault();
    this.memberModalRef = this.modalService.open(this.memberModal);
  }

  submitForm(formData) {
    if (this.mainContact === null || !this.mainContact) {
      alert('Please select a member as main contact for this booking.');
    } else {
      alert('WIP');
    }
  }


}

class BasicMember {
    constructor(
      public id: number,
      public fullName: string,
      public memberNumber: number
    ) {}
}

