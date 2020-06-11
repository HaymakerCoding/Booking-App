
/**
 * Invitation from one user to another to play golf
 * @author Malcolm Roy
 */
export class Invite {

  constructor(
    public id: number,
    public invitedBy: number,
    public invitedByName: string,
    public memberId: number, // user id of the member invited it issued to
    public date: any,
    public courseId: number,
    public courseName: string,
    public accepted: any,
    public respondedAt: boolean | null,
    public userDeleted: boolean,
    public dateTime: any

  ) {}

}
