
/**
 * Golf Booking
 * @author Malcolm Roy
 */
export class Booking {

  constructor(
    public id: number,
    public courseId: number,
    public courseName: string | null,
    public dateFor: string,
    public displayDate: string,
    public eventName: string,
    public comments: string,
    public lastUpdated: string,
    public updatedBy: number,
    public createdByName: string,
    public numPlayers: number,
    public bookedBy: number,
    public playFee: number,
    public bookedFor: number,
    public cancelled: string,
    public teeTime: any,
    public teeTimeId: any,
    public cancelledOn: any,
    public cancelledTime: any

  ) {}

}
