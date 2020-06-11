import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Input, TemplateRef, LOCALE_ID, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { BasicMember } from '../models/BasicMember';
import { MessageService } from '../services/message.service';
import { Message } from '../models/Message';
import { Member } from '../models/Member';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckbox } from '@angular/material/checkbox';
import { BookingService } from '../services/booking.service';
import { Booking } from '../models/Booking';
import { MatTableDataSource } from '@angular/material/table';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { InviteService } from '../services/invite.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit, OnDestroy, AfterViewInit {

  loading: boolean;

  members: BasicMember[];
  memberResults: BasicMember[] = [];

  // array of memberIds for sending out invites to the members
  invited: number[] = [];

  // list of all bookings where they were reserved with the invite flag.
  allInvites: Booking[] = [];

  loggedUser: Member;

  reservations: Reservation[] = [];
  dataSource: MatTableDataSource<any>;

  treeControl: FlatTreeControl<any>;

  treeFlattener;
  treeDataSource;

  dialogRef: MatDialogRef<any>;

  @Input() buddyLists: BuddyNode[] = [];

  subscriptions: Subscription[] = [];

  inviteDate: any;
  inviteCourse: number; // ID course golf course
  inviteCourseName: string;

  private transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      memberId: node.children ? null : node.memberId,
      id: node.children ? null : node.id,
      listName: node.children ? null : node.listName,
      length: node.children ? node.children.length : null,
      level,
    };
  }

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private bookingService: BookingService,
    private matDialog: MatDialog,
    private inviteService: InviteService,
    @Inject(LOCALE_ID) private locale: string
  ) { }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnInit() {
    this.setupBuddyListTree();
    this.getUpcommingInvites();
  }

  /**
   * Initialize the tree structure with Buddy Lists
   */
  setupBuddyListTree() {
    this.treeControl = new FlatTreeControl<FlatNode>(
      node => node.level, node => node.expandable
    );
    this.treeFlattener = new MatTreeFlattener(
      this.transformer, node => node.level, node => node.expandable, node => node.children);

    this.treeDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    // filter out any buddy lists with no buddies as they would not be needed in an invite list
    this.buddyLists = this.buddyLists.filter(x => x.children && x.children.length > 0);
    this.treeDataSource.data = this.buddyLists;
  }

  ngAfterViewInit() {

  }

  /**
   * Obtain all bookings in the database where a flag was set to reserve these spots as INVITES for other members
   */
  getUpcommingInvites() {
    this.subscriptions.push(this.inviteService.getAllReservedInvites().subscribe(response => {
      if (response.status === 200) {
        this.allInvites = response.payload;
        this.groupInvites();
      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Go through all bookings that are invites and group them together by date
   */
  groupInvites() {
    const found: any[] = [];
    this.allInvites.forEach(x => {
      if (found.find(y => y === x.dateFor )) {
        const res = this.reservations.find(y => y.date === x.dateFor);
        res.maxSpots += 1;
        if (x.invite !== 'accepted') {
          res.spotsLeft += 1;
        }
      } else {
        found.push(x.dateFor);
        const newRes = new Reservation(x.dateFor, x.displayDate, x.courseName, x.courseId, 0, 1);
        if (x.invite !== 'accepted') {
          newRes.spotsLeft += 1;
        }
        this.reservations.push(newRes);
      }
    });
    this.dataSource = new MatTableDataSource(this.reservations);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  /**
   * Add a single member to the invited list, by adding their member ID
   * @param memberId Member ID of member to add
   * @param checkBox Material Check Box Element that fired the event on change
   */
  addToInvited(memberId: number, checkBox: MatCheckbox) {
    if (checkBox.checked) {
      this.invited.push(memberId);
    } else {
      this.invited = this.invited.filter(x => x !== memberId);
    }
  }


  /**
   * Add a full List of buddies to the invited
   * @param listName The name of the Buddy List
   * @param checkBox Checkbox Element that was clicked
   */
  addBuddyListToInvited(listName, checkBox) {
    // find the list by its name
    const list = this.buddyLists.find(x => x.name === listName).children;
    if (checkBox.checked) {
      // add all member ids of the buddies to the invitied array IF not already on it
      list.forEach(x => {
        if (!this.invited.includes(x.memberId)) {
          this.invited.push(x.memberId);
        }
      });
    } else {
      // checkbox being unchecked so remove all buddies on that list from invited array
      for (const l of list) {
        this.invited = this.invited.filter(x => x !== l.memberId);
      }
    }
  }

  /**
   * Check if this member id is already in the invited list
   * @param memberId Member ID
   */
  isInvited(memberId): boolean {
    return this.invited.includes(memberId);
  }

  /**
   * Material table definitions for columns
   */
  getColumns(): string[] {
    return ['date', 'course', 'responses', 'spotsLeft', 'invite'];
  }

  closeDialog() {
    this.dialogRef.close();
  }

  /**
   * Display the dialog for choosing buddies to send the invites to.
   * @param inviteDialog Template Ref of UI for selecting buddies
   * @param date Date for the invites
   * @param course Course for the invites
   */
  openInviteDialog(inviteDialog: TemplateRef<any>, date, courseId, courseName) {
    this.inviteDate = date;
    this.inviteCourse = courseId;
    this.inviteCourseName = courseName;
    this.dialogRef = this.matDialog.open(inviteDialog, { width: '400px', autoFocus: false});
  }

  /**
   * Send the invites off to all member's selected
   * Server will handle sending emails and saving system messages.
   * Data needed is just a list of member IDs for players to invite and the course and date to play
   */
  sendInvites() {
    const displayDate = formatDate(this.inviteDate, 'mediumDate', this.locale);
    this.subscriptions.push(this.inviteService.sendOutInvites(this.inviteCourse, this.inviteDate, this.invited,
        displayDate, this.inviteCourseName).subscribe(response => {
          if (response.status === 200) {
            this.dialogRef.close();
            this.snackbar.open(this.invited.length + ' invites sent.', ' ', { duration: 3000 } );
          } else {
            alert('Sorry there was an error sending 1 or more of the invites.');
            console.error(response);
          }
        })
    );
  }

  /**
   * Get user invite responses for the reservation passed in then build dialog with data
   * @param resultsDialog Dialog template ref to open
   * @param reservation Golf reservation
   */
  viewResponses(resultsDialog, reservation: Reservation) {
    this.subscriptions.push(this.inviteService.getAllInviteResponses(reservation.date, reservation.courseId).subscribe(response => {
      console.log(response);
      if (response.status === 200) {
        const data = response.payload;
        this.dialogRef = this.matDialog.open(resultsDialog, { width: '300px',  data });

      } else {
        console.error(response);
      }
    }));
  }

  /**
   * Return the text display color based on the status of the invitation
   * @param status Status text of invite
   */
  getResponseColor(status: string) {
    if (status === 'accepted') {
      return  '#21a0c4';
    } else if (status === 'declined') {
      return 'red';
    } else {
      return 'black';
    }
  }


}

/**
 * Respresents grouped up reservations booked by a user for other users
 */
class Reservation {

  constructor(
    public date: any,
    public displayDate: any,
    public course: string,
    public courseId: number,
    public spotsLeft: number,
    public maxSpots: number
  ) {}
}

interface BuddyNode {
  name: string;
  children?: Buddy[] ;
}

class Buddy {
  constructor(
    public id: number,
    public name: string,
    public memberId: number,
    public listName: string
  )  {}
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
