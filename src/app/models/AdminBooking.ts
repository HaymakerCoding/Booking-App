
/**
 * Tee Time booked by admin
 * @author Malcolm Roy
 */
export class AdminBooking {

  constructor(
    public id: number,
    public courseId: number,
    public courseName: string,
    public dateFor: string,
    public reservationIds: number[],
    public comments: string,
    public eventName: string,
    public updatedBy: number,
    public updatedByName: string,
    public lastUpdated: any

  ) {}

}
