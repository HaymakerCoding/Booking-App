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
import { BuddyList } from '../models/BuddyList';

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
  // array of just string names
  buddyListNames: string[] = [];
  // array of List objects, list name and record ID
  lists: BuddyList[] = [];

  MAX_BUDDIES_PER_LIST = 100;

  private transformer = (node: any, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      pic: node.children ? null : node.pic,
      memberId: node.children ? null : node.memberId,
      listId: node.children ? null : node.listId,
      id: node.children ? null : node.id,
      length: node.children ? node.children.length : null,
      parent: node.editMode === false ? true : false,
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
  editName(listId: number, newName) {
    // regex to test that name has at least 1 letter
    const regex = new RegExp('^(?=.*[A-Za-z])');
    if (regex.test(newName)) {
      this.subscriptions.push(this.buddyService.updateListName(listId, newName).subscribe(response => {
        if (response.status === 200) {
          // change all in memory records from old to new name
          this.lists.find(x => x.id === listId).name = newName;
          this.buddyLists.find(x => x.id === listId).name = newName;
          this.dataSource.data = this.buddyLists;
        } else {
          console.error(response);
        }
      }));
    } else {
      alert('Sorry your list name must contain at least 1 letter');
    }
  }

  /**
   * Create a new empty Buddy list for this user
   * @param listName User input name for list
   */
  createList(listName, input: MatInput) {
    const regex = new RegExp('^(?=.*[A-Za-z])');
    if (regex.test(listName)) {
      this.subscriptions.push(this.buddyService.createList(listName).subscribe(response => {
        if (response.status === 201) {
          this.lists.push(new BuddyList(response.payload, listName));
          const node: BuddyNode = { id: response.payload, name: listName, children: null, editMode: false};
          this.buddyLists.push(node);
          this.dataSource.data = this.buddyLists;
          this.snackbar.open(listName + ' created!', ' ' , { duration: 2000 });
          input.value = null;
        } else if (response.status === 512 ) {
          alert('Sorry this list already exists. No exact duplicate lists names.');
          console.error(response);
        } else {
          alert('Sorry something went wrong creating the list');
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
        alert('Sorry there was an error fetching user data from the database.');
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
        this.lists = response.payload;
        this.lists.forEach(x => {
          this.buddyListNames.push(x.name);
        });
        if (this.lists.length > 0) {
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
    this.lists.forEach(list => {
      this.subscriptions.push(this.buddyService.getAll(list.id).subscribe(response => {
        if (response.status === 200) {
          num++;
          const buddies = [];
          response.payload.forEach(x => {
            this.allBuddies.push(x);
            const buddy = new Buddy(x.id, x.fullName, null, x.memberId, list.id);
            buddies.push(buddy);
          });
          const node: BuddyNode = { id: list.id, name: list.name, children: buddies, editMode: false};
          this.buddyLists.push(node);
          if (num >= this.lists.length) {
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
      if (list.children) {
        list.children.forEach(x => {
          if (x.memberId === member.memberId) {
            found = true;
          }
        });
      }
    });
    return found;
  }

  /**
   * Search ALL members in the database matching any part of their full name to the input text.
   * Results limited to max 25 results
   * @param text User input text to search for
   */
  searchMembers(text: string) {
    this.memberResults = [];
    if (text !== '' && text.length >= 3 ) {
      this.members.forEach(x => {
        if (x.fullName.toLowerCase().includes(text.toLowerCase()) && this.memberResults.length < 25 &&
              x.memberId !== this.loggedUser.id) {
          this.memberResults.push(x);
        }
      });
      this.getImagesForMembers(this.memberResults);
    } else if (text.length < 3) {
      alert('Please provide at least 3 characters of a name to start search');
    }
  }

  /**
   * Grab the images for a group of members. Images come from AWS s3 bucket
   * @param members List of Basic Members
   */
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
    this.dialogRef = this.matDialog.open(dialog, { data: member});

  }


  /**
   * User is adding a new buddy to their list.
   * Determine if its a new list or adding to one already available
   * @param member Member to add
   * @param listId PK of list to add to NULL if new list
   * @param listName New list name, NULL if adding to existing
   */
  onAddBuddy(member: BasicMember, listId: number, listName: string) {
    if (listName) {
      // new list required
      // regex to test that name has at least 1 letter
      const regex = new RegExp('^(?=.*[A-Za-z])');
      if (regex.test(listName)) {
        // create a new list before adding member to it
        this.subscriptions.push(this.buddyService.createList(listName).subscribe(response => {
          if (response.status === 201) {
            // payload returns new record ID
            listId = response.payload[0];
            this.lists.push(new BuddyList(listId, listName));
            const node: BuddyNode = { id: listId, name: listName, children: null, editMode: false};
            this.buddyLists.push(node);
            this.addBuddy(member, listId);
          } else if (response.status === 512 ) {
            alert('Sorry this list already exists. No exact duplicate lists names.');
            console.error(response);
          } else {
            alert('Sorry something went wrong creating the list');
            console.error(response);
          }
        }));
      } else {
        alert('Sorry your list name must contain at least 1 letter');
      }
    } else {
      this.addBuddy(member, listId);
    }
  }

  /**
   * Add a new 'Buddy' member to the user's buddy list
   * This requires adding a new buddy record for the member selected (with list name selected) then updating view data
   * @param member Member to add
   * @param listId PK matching list name to add to
   */
  addBuddy(member: BasicMember, listId: number) {
    this.dialogRef.close();
    // ensure buddy is not already on list AND set a soft cap of 100 for the max buddies in a list
    const list = this.buddyLists.find(x => x.id === listId);
    // check if already on this list
    const found = list.children ? list.children.find(x => x.memberId === member.memberId) : null;
    if (found) {
      alert('Sorry this member is already on this buddy list');
    } else {
      let numBuddiesOnList;
      let isBuddy: boolean;
      // check number of buddies in the list
      list.children ? numBuddiesOnList = list.children.length : numBuddiesOnList = 0;
      // check if buddy is already in the list
      list.children ? isBuddy = this.isBuddy(member) : isBuddy = false;
      if (numBuddiesOnList <= this.MAX_BUDDIES_PER_LIST) {
        this.subscriptions.push(this.buddyService.add(member.memberId, listId).subscribe(response => {
          if (response.status === 201) {
            // Buddy record added to db now we add the member to all buddies as well as nodes
            this.allBuddies.push(member);
            // id of newly created record returned in payload
            const recordId = response.payload[0];
            if (!list.children) {
              list.children = [];
            }
            list.children.push(new Buddy(recordId, member.fullName, null, member.memberId, list.id));
            this.dataSource.data = this.buddyLists;
            this.snackbar.open(member.fullName + ' was added to your buddy list.', '', { duration: 3000 });
          } else {
            alert('Sorry there was an error sending your request. Please try again later.');
            console.error(response);
          }
        }));
      }
    }
  }

  /**
   * DELETE a buddy record
   * @param id Buddy record ID, PK for delete
   * @param listId Buddy List ID (parent Node)
   */
  removeBuddy(id: number, listId: number) {
    this.subscriptions.push(this.buddyService.remove(id.toString()).subscribe(response => {
      if (response.status === 200) {
        // now remove buddy from the in memory lists
        const list = this.buddyLists.find(x => x.id === listId);
        list.children = list.children.filter(x => x.id !== id);
        this.dataSource.data = this.buddyLists;
      } else {
        alert('Sorry there was a problem removing the buddy record. Try back later or contact ClubEG.');
        console.error(response);
      }
    }));
  }

  /**
   * Drop a user's buddy list and all buddies on it
   * @param id List ID
   */
  removeBuddyList(list: BuddyList) {
    const answer = confirm('Are you sure you want to delete \'' + list.name + '\' and all buddies on it?');
    if (answer) {
      this.subscriptions.push(this.buddyService.removeList(list.id).subscribe(response => {
        // filter out the old
        this.buddyLists = this.buddyLists.filter(x => x.id !== list.id);
        this.lists = this.lists.filter(x => x.id !== list.id);
        this.dataSource.data = this.buddyLists;
      }));
    }
  }

  /**
   * Return the total number of buddies in ALL lists
   */
  getNumBuddies(): number {
    let num = 0;
    this.buddyLists.forEach(x => {
      if (x.children) {
        num += x.children.length;
      }
    });
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
  id: number;
  name: string;
  children?: Buddy[] ;
  editMode: boolean;
}

class Buddy {
  constructor(
    public id: number,
    public name: string,
    public pic: any,
    public memberId: number,
    public listId: number
  )  {}
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
