
/**
 * Represent a ClubEG member this is Basic info for listing all members
 * @author Malcolm Roy
 */
export class BasicMember {

  constructor(
      public memberId: number,
      public fullName: string | null,
      public memberNumber: number,
      public pic: any

  ) {}

  public clear() {
    this.fullName = null;
    this.memberId = null;
    this.memberNumber = null;
  }

}
