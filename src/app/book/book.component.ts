import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Renderer2,
   ViewChildren, QueryList } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Member } from '../models/Member';
import { BasicMember } from '../models/BasicMember';
import { Subscription } from 'rxjs';
import { User } from '../models/User';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { CourseService } from '../services/course.service';
import * as jwt_decode from 'jwt-decode';
import { Course } from '../models/Course';
import { MatStepper } from '@angular/material/stepper';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInput } from '@angular/material/input';
import { MemberService } from '../services/member.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TeeTimesComponent } from '../tee-times/tee-times.component';
import { BookingService } from '../services/booking.service';
import { PreBooking } from '../models/PreBooking';
import { TeeTime } from '../models/TeeTime';
import { ChronoGolfService } from '../services/chronoGolf.service';
import { MemberSearchComponent } from '../member-search/member-search.component';
import { BuddyService } from '../services/buddy.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren('steppers') private steppers: QueryList<MatStepper>;

  dates: any[] = [];
  loading: boolean;
  processing: boolean;

  dateSelected: string[];
  courseSelected: Course;

  userLoggedIn: boolean;

  memberTableColumns: string[] = ['course', 'spots', 'players'];
  lmcTableColumns: string[] = ['course', 'fee', 'spots', 'players'];

  finishTableColumns: string[] = ['name', 'memberNumber', 'teeTime', 'fee'];

  spotsSelected: number;
  spotsSelectedArray: number[] = [];
  selectedTeeTimes: TeeTime[];
  allTeeTimes: any[] = [];

  membersSelected: MemberSelected[] = [];
  allMembers: BasicMember[];

  subscriptions: Subscription[] = [];

  loggedUser: Member;

  courses: Course[];
  coursesInitialized = 0;

  lmc = false;

  preBooking: PreBooking;

  smallScreen = false;
  announcementHTML;
  dataSource; // data source for final table, value assigned at end of step 3

  buddyLists: BuddyNode[] = [];
  buddyListNames: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private courseService: CourseService,
    private memberService: MemberService,
    private breakpointObserver: BreakpointObserver,
    private renderer2: Renderer2,
    private matDialogService: MatDialog,
    private bookingService: BookingService,
    private chronoGolfService: ChronoGolfService,
    private buddyService: BuddyService
  ) { }

  ngOnInit() {
    this.processing = false;
    this.setupDates();
    this.getUserData();

    // observe screen size for determning vertical or horizontal stepper
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe( response => {
      this.smallScreen = response.matches;
    });
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * Move the stepper UI forward a step
   */
  goForward() {
    this.steppers.first.next();
  }

  /**
   * if an lmc booking return table columns with fee definition
   */
  getColumns() {
    let columns;
    this.lmc === true ? columns = this.lmcTableColumns : columns = this.memberTableColumns;
    return columns;
  }

  getUserData() {
    this.loading = true;
    this.subscriptions.push(this.userService.getUserInfo().subscribe(response => {
      if (response.status === '200') {
        this.loggedUser = response.payload[0];
        this.getMemberList();
      } else {
        console.log('Sorry there was an error fetching user data from the database.');
        console.error(response.status);
      }
    }));
  }

  /**
   * Get a list of all members. Need this for step 3 where we add memebers
   */
  getMemberList() {
    this.subscriptions.push(this.memberService.getAllMembers().subscribe(response => {
      if (response.status === '200') {
        this.allMembers = response.payload;
        this.getAnnouncement();
      } else {
        console.log('Sorry there was an error fetching user data from the database.');
        console.error(response.status);
      }
    }));
  }

  /**
   * Get all the courses available to book at for the day selected.
   * After getting courses we neet to then get regervation numbers for each to determine spots left available
   */
  getCourses() {
    this.loading = true;
    this.subscriptions.push(this.courseService.getAllCourses(this.dateSelected).subscribe(response => {
      if (response.status === '200') {
        this.courses = response.payload;
        this.coursesInitialized = 0;
        if (this.lmc === true) {
          this.courses = this.courses.filter(x => x.lmcSwitch === '1');
        }
        this.courses.forEach(course => {
          this.getCourseReservations(course);
        });
      } else {
        console.error(response.status);
      }
    }));
  }

  /**
   * Get the reservations made for each course. Use these numbers to determine spots left available to book at.
   * @param course Golf Course
   */
  getCourseReservations(course: Course) {
    this.subscriptions.push(this.courseService.getNumRegistrations(course.courseId, this.dateSelected[0]).subscribe(response => {
      this.loading = false;
      if (response.status === '200') {
        course.numReservations = response.payload[0];
        this.coursesInitialized++;
        if (this.coursesInitialized === this.courses.length) {
          // all courses should have their reservation numbers now
          // setup the spots left avail
          this.courses.forEach(x => {
            x.spotsLeft = Number(x.totalSpots) - x.numReservations;
            const spots = [];
            for (let y = 0; y < x.spotsLeft; y++) {
              spots.push(y);
            }
            x.spots = spots;
          });
          // filter out courses with no spots avail
          // this.courses = this.courses.filter(x => x.spotsLeft > 0 );
          this.goForward();
        }
      } else {
        alert('Sorry database unavailable');
        console.error(response.status);
      }
    }));
  }

  /**
   * User selected a course and the corresponding number of spots to book there, by clicking checkbox.
   * We set a simple array to store the numbers to interate when setting up the next page.
   * @param course Golf Course selected
   * @param numSpots Spots wanting to book
   * @param button checkbox clicked
   */
  selectCourse(course: Course, numSpots, button: MatCheckbox) {
    this.courseSelected = course;
    this.spotsSelectedArray = [];
    if (!button.checked) {
      // if button is being unchecked we don't want to include it in the count for spots
      numSpots = numSpots - 1;
    }
    for (let x = 0; x < numSpots; x++) {
      this.spotsSelectedArray.push(x);
    }
    this.spotsSelected = numSpots;
  }

  /**
   * Set a list of dates from today to next 7 days.
   * We need an mysql formated date for the database and a use friendly display date so both are stored in the dates array.
   */
  setupDates() {
    for (let x = 0; x < 8 ; x++) {
      // try offsetting for timezone, javascript dates are a pain!
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const mysqlDate = new Date(new Date().setDate(new Date().getDate() + x) - tzoffset).toJSON().slice(0, 10);
      const date = new Date(new Date().setDate(new Date().getDate() + x));
      const weekday = this.getDayText(date.getDay());
      const month = this.getMonthText(date.getMonth());
      const day = date.getDate();
      const displayDate = weekday + ' ' + month + ' ' + day;
      this.dates.push([mysqlDate, displayDate]);
    }
  }

  /**
   * Set the date select by user for booking golf, send to next step
   * @param date Date selected contains an array first element Mysql formated date, second display style of date
   */
  selectDate(date: string[]) {
    this.membersSelected = [];
    this.spotsSelected = 0;
    this.spotsSelectedArray = [];
    this.dateSelected = date;
    this.spotsSelected = null;
    this.courseSelected = null;
    this.getCourses();
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
   * Alert user if they try to go to next step without choosing a course
   */
  checkCourseSelected() {
    if (this.courseSelected === null) {
      alert('Please choose a course');
    } else {
      // course and spots selected so initialize the memberSelected array which will be populated in next step
      this.membersSelected = [];
      this.membersSelected.push(new MemberSelected(this.loggedUser.id, this.loggedUser.firstName + ' ' +
          this.loggedUser.lastName, this.loggedUser.memberNumber, null, null));
      for (let x = 0 ; x < this.spotsSelected - 1; x++) {
        this.membersSelected.push(new MemberSelected(null, null, null, null, null));
      }
    }
  }

  /**
   * Returns user text warning if they try to go to next step without filling in all members for spots
   */
  checkMemberSelected() {
    for (const member of this.membersSelected) {
      if (member.memberNumber === null) {
        alert('Please add members for all spots');
        break;
      }
    }
    this.dataSource = this.membersSelected;
  }

  /**
   * Return boolean of whether we still have null members selected. used for completiion of step in stepper
   */
  checkMembers() {
    if (this.membersSelected.length < this.spotsSelected) {
      return false;
    }
    for (const member of this.membersSelected) {
      if (member.memberNumber === null) {
        return false;
      }
    }
    return true;
  }

  /**
   * Search through all members and find the one matching the user input. Match by member number.
   * Add positive match the members selected array at the appropriate index.
   * @param input Input that has the member number as the value
   * @param index Index for array of members
   */
  findMember(input: MatInput, index) {
    const size = input.value.length;
    // member numbers should be at least 4 characters
    if (this.membersSelected[index].memberNumber) {
      this.membersSelected[index].memberId = null;
      this.membersSelected[index].memberNumber = null;
      this.membersSelected[index].fullName = null;
    }
    if (size >= 4 ) {
      let member: BasicMember;
      member = this.allMembers.find(x => x.memberNumber.toString() === input.value);
      if (member) {
        this.membersSelected[index] = new MemberSelected(member.memberId, member.fullName, member.memberNumber, null, null);
      }
    }
  }

  /**
   * Fired on change of step in the stepper. Needed to do the logic between steps if a user clicks the icons instead of 'next'
   * @param stepper MatStepper StepperSelectionEvent
   */
  selectionChange(stepper: StepperSelectionEvent) {
    if (stepper.selectedIndex === 2) {
      this.checkCourseSelected();
    } else if (stepper.selectedIndex === 3) {
      this.checkMemberSelected();
    }
  }

  getPlayFee(memberId) {
    // do any logic here needed for determining which fee to send back
    if (this.lmc === true) {
      // last minute club fees
      return Number(this.courseSelected.lmcFee);
    } else {
      // regular fees
      return Number(this.courseSelected.regFullFee);
    }
  }

  /**
   * Get Fees for all players combined for total
   */
  getTotalFee() {
    let total = 0;
    for (const member of this.membersSelected ) {
      total += this.getPlayFee(member.memberId);
    }
    return total;
  }

  /**
   * Show a Dialog of Buddies and all members that the user can select from to book spots with/for
   * This search is instead of adding a member number, this will add the number automatically for selected member
   */
  showMemberSearch(numInput: HTMLInputElement, index) {
    const modalRef = this.matDialogService.open(MemberSearchComponent, {
      data: {members: this.allMembers, buddyLists: this.buddyLists, buddyListNames: this.buddyListNames }
    });

    modalRef.afterClosed().subscribe(response => {
      if (response) {
        // on close the dialog returns a Member obj as the selected member, so we add to array and update Input in view
        numInput.value = response.member.memberNumber;
        this.membersSelected[index] = response.member;
      }
    });
  }

  /**
   * Provide tee times popup dialog for selecting a tee time for the member clicked
   */
  showTeeTimeModal() {
    const modalRef = this.matDialogService.open(TeeTimesComponent, {
      data: {
        courseId: this.courseSelected.courseId,
        courseName: this.courseSelected.courseName,
        date: this.dateSelected[0],
        displayDate: this.dateSelected[1],
        numPlayers: this.membersSelected.length
      }
    });
    modalRef.afterClosed().subscribe(response => {
      if (response) {
        if (response.error && response.error === 403) {
          // probably a token expiry, send to login
          this.router.navigate(['/Login']);
        } else {
          // response contains the tee times selected, if it doesn't exist than modal was closed without saving/selecting times
          this.selectedTeeTimes = response.teeTimes;
          for (const teeTime of this.selectedTeeTimes) {
            for (let x = 0; x < teeTime.freeSlots; x++) {
              this.allTeeTimes.push(new MemberTeeTime(null, teeTime.id, teeTime.startTime));
            }
          }
        }
      }
    });
  }

  /**
   * Tee Time is removed from member and placed back in bulk list of times
   * @param event Drop Event
   */
  dropBack(event) {
    // only drop back if the time is comming from a different container.
    if (event.previousContainer !== event.container) {
      const member: MemberSelected = event.previousContainer.data;
      this.allTeeTimes.push(member.teeTime);
      member.teeTime = null;
    }
  }

  /**
   * Tee Time is dropped onto a member to assign that tee time to them.
   * @param event Drop Event
   * @param memberId ID of member this tee time is being assigned to
   */
  drop(event, memberId) {
    const member = this.membersSelected.find(x => x.memberId === memberId);
    if (!member.teeTime) {
      if (event.previousContainer === event.container) {
        alert('here');
      } else {
        // assign member to this tee time
        this.allTeeTimes[event.previousIndex].memberId = memberId;
        // assign tee time to member
        member.teeTime = this.allTeeTimes[event.previousIndex];
        // remove tee time from available
        this.allTeeTimes = this.allTeeTimes.filter(x => x !== this.allTeeTimes[event.previousIndex]);
      }
    } else {
      // replace tee time with new on member
      const newTeeTime = this.allTeeTimes[event.previousIndex];
      const oldTeeTime = member.teeTime;
      member.teeTime = newTeeTime;
      this.allTeeTimes = this.allTeeTimes.filter(x => x !== newTeeTime);
      this.allTeeTimes.push(oldTeeTime);
    }
  }

  /**
   * User clicked finish so reserve the tee time with the exernal API then go to 'completeBooking'
   */
  finish() {
    // for each member selected we need to reserve their tee time with chronogolf
    this.processing = true;
    const errors = [];
    let count = 0;
    this.membersSelected.forEach(x => {
      if (x.teeTime !== null) {
        this.subscriptions.push(this.chronoGolfService.addReservation(x.teeTime.teeTimeId, 18, this.courseSelected.courseId)
          .subscribe(response => {
            if (response.status === '201') {
              x.teeTimeReservationId = response.payload;
            } else {
              console.error(response);
              errors.push('Error reserving tee time for: ' + x.fullName);
            }
            count++;
            if (count >= this.membersSelected.length) {
              // done all
              this.processing = false;
              // display any errors
              if (errors.length > 0) {
                errors.forEach(error => {
                  console.error(error);
                });
                alert('Sorry there were errors securing tee times for all or some of the players.');
              } else {
                // no errors go to complete booking
                this.completeBooking();
              }
            }
        }));
      } else {
        count++;
        if (count >= this.membersSelected.length) {
          // done all
          this.processing = false;
          // display any errors
          if (errors.length > 0) {
            errors.forEach(error => {
              console.error(error);
            });
            alert('Sorry there were errors securing tee times for all or some of the players.');
          } else {
            // no errors go to complete booking
            this.completeBooking();
          }
        }
      }
    });
  }

  /**
   * Final booking step, send the Booking info to the database.
   * We send the common data like date, course, etc. and the array of members which holds specific data like each players
   * tee time reservation
   */
  completeBooking() {
    const members = [];
    this.membersSelected.forEach(x => {
      members.push(x.memberId);
    });
    this.preBooking = new PreBooking(this.dateSelected[0], this.courseSelected.courseId, this.membersSelected, this.loggedUser.id, null);
    this.subscriptions.push(this.bookingService.add(this.preBooking, this.dateSelected[1], this.courseSelected.courseName)
      .subscribe(response => {
        if (response.status === 201) {
          this.router.navigate(['/Book/All/200']);
        } else {
          alert('Sorry, there was an error processing the booking(s).');
          console.error(response);
        }
      }));
  }

  reset() {
    this.membersSelected = [];
    this.dataSource = null;
    this.selectedTeeTimes = [];
    this.spotsSelected = null;
    this.spotsSelectedArray = [];
    this.courseSelected = null;
    this.steppers.first.reset();
  }

  /**
   * Retrieve just the text for announcement display in html
   */
  getAnnouncement() {
    this.subscriptions.push(this.bookingService.getAnnouncement().subscribe(response => {
      if (response.status === '200') {
        this.announcementHTML  = response.payload[0];
        this.checkLMC();
      } else {
        console.error(response.status);
      }
    }));
  }

  /**
   * Check if the user is requesting the LMC bookings. This sets a flag that skips the first step since we use today's date.
   */
  checkLMC() {
    const url = this.router.url;
    if (url === '/LMC') {
      this.lmc = true;
      this.selectDate(this.dates[0]);
    }
    this.getBuddyLists();
  }

  /**
   * Get just a list of the buddy list names.
   */
  getBuddyLists() {
    this.subscriptions.push(this.buddyService.getAllLists().subscribe(response => {
      if (response.status === 200) {
        this.buddyListNames = response.payload;
        if (this.buddyListNames.length > 0) {
          this.getBuddies();
        } else {
          this.loading = false;
        }
      } else {
        alert('Sorry there was a problem fetching your buddy lists');
        console.error(response);
      }
    }));
  }

  /**
   * Get all buddies for the logged in user for each list they have
   */
  getBuddies() {
    let num = 0;
    this.buddyListNames.forEach(name => {
      this.subscriptions.push(this.buddyService.getAll(name).subscribe(response => {
        if (response.status === 200) {
          num++;
          const buddies = [];
          response.payload.forEach(x => {
            // this.allBuddies.push(x);
            const buddy = new Buddy(x.id, x.fullName, null, x.memberId, x.listName);
            buddies.push(buddy);
          });
          const node: BuddyNode = {name, children: buddies};
          this.buddyLists.push(node);
          if (num >= this.buddyListNames.length) {
            // all lists initialized
            this.getImagesForBuddies();
          }
        } else {
          alert('Sorry there was a problem loading your buddy data');
          console.error(response);
        }
      }));
    });
  }

  /**
   * Initialize all avatar pics for the members in the user's buddy lists
   */
  getImagesForBuddies() {
    const totalNeeded = this.getNumBuddies();
    let totalDone = 0;
    this.buddyLists.forEach(x => {
      for (const member of x.children) {
        this.subscriptions.push(this.memberService.getMemberPic(member.memberId.toString()).subscribe(response => {
          if (response.status === '200') {
            member.pic = response.payload[0];
          }
          totalDone++;
          if (totalDone >= totalNeeded) {
            // all images loaded
            this.loading = false;
          }
        }));
      }
    });
  }

  /**
   * Return the total number of buddies in ALL lists
   */
  getNumBuddies(): number {
    let num = 0;
    this.buddyLists.forEach(x => num += x.children.length);
    return num;
  }

}

class MemberSelected {
  constructor(
    public memberId: number,
    public fullName: string | null,
    public memberNumber: number,
    public teeTime: MemberTeeTime,
    public teeTimeReservationId: any
  ) {}
}

class MemberTeeTime {
  constructor(
  public memberId: number,
  public teeTimeId: number,
  public startTime: any
  ) {}
}

interface BuddyNode {
  name: string;
  children?: Buddy[] ;
  pic?: any;
  editMode?: boolean;
}

class Buddy {
  constructor(
    public id: number,
    public name: string,
    public pic: any,
    public memberId: number,
    public listName: string
  )  {}
}
