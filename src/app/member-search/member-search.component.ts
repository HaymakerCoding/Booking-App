import { Component, OnInit, Input, Inject } from '@angular/core';
import { BasicMember } from '../models/BasicMember';
import { MatDialogRef, MAT_DIALOG_DATA  } from '@angular/material/dialog';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MemberService } from '../services/member.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-member-search',
  templateUrl: './member-search.component.html',
  styleUrls: ['./member-search.component.scss']
})
export class MemberSearchComponent implements OnInit {

  numBuddies: number;
  numMembers: number;

  treeControl: FlatTreeControl<any>;

  treeFlattener;
  dataSource;

  @Input() members: BasicMember[];
  memberResults: BasicMember[] = [];

  @Input() buddyLists: BuddyNode[] = [];

  subscriptions: Subscription[] = [];

  MAX_BUDDIES_PER_LIST = 20;

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
    @Inject (MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MemberSearchComponent>,
    private memberService: MemberService
  ) { }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  ngOnInit() {
    this.numBuddies = 0;
    this.numMembers = 0;
    this.members = this.data.members;
    this.buddyLists = this.data.buddyLists;

    this.treeControl = new FlatTreeControl<FlatNode>(
      node => node.level, node => node.expandable
    );
    this.treeFlattener = new MatTreeFlattener(
      this.transformer, node => node.level, node => node.expandable, node => node.children);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = this.buddyLists;
  }

  searchMembers(text: string) {
    this.memberResults = [];
    if (text !== '' && text.length >= 3 ) {
      this.members.forEach(x => {
        if (x.fullName.toLowerCase().startsWith(text.toLowerCase()) && this.memberResults.length < 20) {
          this.memberResults.push(x);
        }
      });
      this.getImagesForMemberResults();
    } else if (text.length < 3) {
      alert('Please provide at least 3 characters of a name to start search');
    }
  }

  /**
   * Used to get/set the avatars for the members that were returned from the name search only
   * We will let these lazy load and not worry about a spinner for now
   */
  getImagesForMemberResults() {
    for (const member of this.memberResults) {
      this.subscriptions.push(this.memberService.getMemberPic(member.memberId.toString()).subscribe(response => {
        if (response.status === '200') {
          member.pic = response.payload[0];
        }
      }));
    }
  }

  chooseMember(memberId: number) {
    const member = this.members.find(x => x.memberId === memberId);
    this.dialogRef.close({ member });
  }

  cancel() {
    this.dialogRef.close();
  }



}

interface BuddyNode {
  id: number;
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
    public listId: number
  )  {}
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}
