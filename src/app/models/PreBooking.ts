import { Member } from './Member';

/**
 * Golf Booking info BEFORE it's sent to the database. Not a db record representation.
 * @author Malcolm Roy
 */
export class PreBooking {

  constructor(
    public date: any,
    public courseId: number,
    public members: any[],
    public reservedBy: number,
    public reservedFor: number

  ) {}

}
