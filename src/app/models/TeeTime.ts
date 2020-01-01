
/**
 * Tee Time from Chrono Golf
 * @author Malcolm Roy
 */
export class TeeTime {

  constructor(
    public id: number,
    public courseId: number,
    public eventId: number | null,
    public blocked: boolean,
    public date: string,
    public startTime: string,
    public hole: number,
    public round: number,
    public format: string,
    public freeSlots: number,
    public uuid: string


  ) {}

}
