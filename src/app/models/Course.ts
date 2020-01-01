
/**
 * Golf Booking
 * Represents a Course and it's available spots
 *
 * @author Malcolm Roy
 */
export class Course {

  constructor(
    public courseId: number,
    public courseName: string,
    public startDate: string,
    public endDate: string,
    public totalSpots: number,
    public status: string,
    public days: string,
    public recNumber: number,
    public spots: number[],
    public numReservations: number,
    public spotsLeft: number,

    public regFullFee: number,
    public regPackFee: number,
    public regPaypFee: number,
    public regCompFee: number,
    public regGuestFee: number,
    public lmcFullFee: number,
    public lmcPackFee: number,
    public lmcPaypFee: number,
    public lmcCompFee: number,
    public lmcGuestFee: number,
    public lmcSwitch: string,
    public lmcFee: number

  ) {}

}
