import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MemberService } from '../services/member.service';
import { BasicMember } from '../models/BasicMember';
import { MessageService } from '../services/message.service';
import { Message } from '../models/Message';
import { Member } from '../models/Member';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuddyService } from '../services/buddy.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { AnimationKeyframesSequenceMetadata } from '@angular/animations';

@Component({
  selector: 'app-buddy-list',
  templateUrl: './buddy-list.component.html',
  styleUrls: ['./buddy-list.component.scss']
})
export class BuddyListComponent implements OnInit, OnDestroy, AfterViewInit {

  subscriptions: Subscription[] = [];

  treeControl: FlatTreeControl<any>;

  treeFlattener;
  dataSource;

  loading: boolean;
  numMembers: number;
  members: BasicMember[];
  memberResults: BasicMember[] = [];
  allBuddies: BasicMember[] = [];

  dialogRef: MatDialogRef<any>;

  loggedUser: Member;

  buddyLists: BuddyNode[] = [];
  buddyListNames: string[] = [];

  MAX_BUDDIES_PER_LIST = 15;

  // flag for editing the name of lists
  editModeOn = false;

  private transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      pic: node.children ? null : node.pic,
      memberId: node.children ? null : node.memberId,
      id: node.children ? null : node.id,
      listName: node.children ? null : node.listName,
      length: node.children ? node.children.length : null,
      level,
    };
  }

  constructor(
    private memberService: MemberService,
    private messageService: MessageService,
    private buddyService: BuddyService,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private matDialog: MatDialog
  ) { }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnInit() {
    this.loading = true;
    this.treeControl = new FlatTreeControl<FlatNode>(
      node => node.level, node => node.expandable
    );
    this.treeFlattener = new MatTreeFlattener(
      this.transformer, node => node.level, node => node.expandable, node => node.children);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = this.buddyLists;

    this.numMembers = 0;

    this.getUserData();
  }

  ngAfterViewInit() {

  }

  /**
   * Change the name of a buddy list
   */
  editName(oldName, newName) {
    // regex to test that name has at least 1 letter
    const regex = new RegExp('^(?=.*[A-Za-z])');
    if (regex.test(newName)) {
      this.subscriptions.push(this.buddyService.updateListName(oldName, newName).subscribe(response => {
        if (response.status === 200) {
          // change all in memory records from old to new name
          const list = this.getBuddyListByName(oldName);
          list.name = newName;
          list.children.forEach(x => x.listName = newName);
          // filter out the old name from array of list names then add the new name
          this.buddyListNames = this.buddyListNames.filter(name => name !== oldName);
          this.buddyListNames.push(newName);
          this.dataSource.data = this.buddyLists;
        } else {
          console.error(response);
        }
      }));
    } else {
      alert('Sorry your list name must contain at least 1 letter');
    }

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  getUserData() {
    this.subscriptions.push(this.userService.getUserInfo().subscribe(response => {
      if (response.status === '200') {
        this.loggedUser = response.payload[0];
      } else {
        console.log('Sorry there was an error fetching user data from the database.');
        console.error(response.status);
      }
      this.getMembers();
    }));
  }

  /**
   * Get all members at the very start. All Clubeg members
   */
  getMembers() {
    this.subscriptions.push(this.memberService.getAllMembers().subscribe(response =>  {
      if (response.status === '200') {
        this.members = response.payload;
        this.numMembers = this.members.length;
      } else {
        console.error(response);
      }
      this.getBuddyLists();
    }));
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
            this.allBuddies.push(x);
            const buddy = new Buddy(x.id, x.fullName, null, x.memberId, x.listName);
            buddies.push(buddy);
          });
          const node: BuddyNode = {name, children: buddies};
          this.buddyLists.push(node);
          if (num >= this.buddyListNames.length) {
            // all lists initialized
            this.loading = false;
            this.dataSource.data = this.buddyLists;
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
            // all images loaded for all buddies so update data source
            this.dataSource.data = this.buddyLists;
          }
        }));
      }
    });
  }

  /**
   * Check if a member is already in the user's buddy lists
   * @param member ClubEG member
   */
  isBuddy(member: BasicMember): boolean {
    let found = false;
    this.buddyLists.forEach(list => {
      list.children.forEach(x => {
        if (x.memberId === member.memberId) {
          found = true;
        }
      });
    });
    return found;
  }

  searchMembers(text: string) {
    this.memberResults = [];
    if (text !== '' && text.length >= 3 ) {
      this.members.forEach(x => {
        if (x.fullName.toLowerCase().startsWith(text.toLowerCase()) && this.memberResults.length < 20 &&
              x.memberId !== this.loggedUser.id) {
          this.memberResults.push(x);
        }
      });
      this.getImagesForMembers(this.memberResults);
    } else if (text.length < 3) {
      alert('Please provide at least 3 characters of a name to start search');
    }
  }

  getImagesForMembers(members) {
    for (const member of members) {
      this.subscriptions.push(this.memberService.getMemberPic(member.memberId.toString()).subscribe(response => {
        if (response.status === '200') {
          member.pic = response.payload[0];
        }
      }));
    }
  }

  /**
   * Toggle the dialog that allows user to select or create the list to add a buddy to
   * @param member Member to add
   * @param dialog Material Dialog
   */
  showChooseList(member: BasicMember, dialog) {
    if (this.isBuddy(member) === false) {
      this.dialogRef = this.matDialog.open(dialog, { data: member});
    }
  }

  /**
   * Add a new 'Buddy' member to the user's buddy list by list name
   * This requires adding a new buddy record for the member selected (with list name selected) then updating view data
   * @param member Member to add
   * @param listName List name to assoicaited buddy to
   */
  addBuddy(member: BasicMember, listName) {
    // regex to test that name has at least 1 letter
    const regex = new RegExp('^(?=.*[A-Za-z])');
    if (regex.test(listName)) {
      this.dialogRef.close();
      if (this.isBuddy(member) === false) {
        this.subscriptions.push(this.buddyService.add(member.memberId, listName).subscribe(response => {
          if (response.status === 201) {
            // Buddy record added to db now we add the member to all buddies as well as nodes
            this.allBuddies.push(member);
            // id of newly created record returned in payload
            const recordId = response.payload[0];
            const list = this.getBuddyListByName(listName);
            if (list) {
              // list exists so add to it
              list.children.push(new Buddy(recordId, member.fullName, null, member.memberId, listName));
            } else {
              // list is a new list so create the new node and children with new member as only child
              const child = new Buddy(recordId, member.fullName, null, member.memberId, listName);
              const children = [];
              children.push(child);
              const newNode: BuddyNode = {
                name: listName,
                children
              };
              this.buddyLists.push(newNode);
            }
            this.dataSource.data = this.buddyLists;
            this.snackbar.open(member.fullName + ' was added to your buddy list.', '', { duration: 3000 });
          } else {
            alert('Sorry there was an error sending your request. Please try again later.');
            console.error(response);
          }
        }));
      }
    } else {
      alert('Sorry your list name must contain at least 1 letter');
    }
  }

  /**
   * DELETE a buddy record
   * @param id Buddy record ID, PK for delete
   */
  removeBuddy(id, listName) {
    this.subscriptions.push(this.buddyService.remove(id).subscribe(response => {
      if (response.status === 200) {
        // now remove buddy from the in memory lists
        this.getBuddyListByName(listName).children = this.getBuddyListByName(listName).children.filter(x => x.id !== id);
        this.dataSource.data = this.buddyLists;
      } else {
        alert('Sorry there was a problem removing the buddy record. Try back later or contact ClubEG.');
        console.error(response);
      }
    }));
  }

  /**
   * Return the total number of buddies in ALL lists
   */
  getNumBuddies(): number {
    let num = 0;
    this.buddyLists.forEach(x => num += x.children.length);
    return num;
  }

  /**
   * Clear the search results for searched Members
   * @param nameInput Input holding search string, need to clear
   */
  clearSearch(nameInput: MatInput) {
    this.memberResults = [];
    nameInput.value = null;
  }

  /**
   * Return the buddy list with the name supplied
   * A list is a Node with a name it's children being the the buddies
   * @param name String name of list
   */
  getBuddyListByName(name): BuddyNode {
    return this.buddyLists.find(x => x.name === name);
  }


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

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
