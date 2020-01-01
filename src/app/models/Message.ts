
/**
 * System Message
 * @author Malcolm Roy
 */
export class Message {

  constructor(
    public id: number,
    public memberTo: number,
    public memberFrom: number,
    public msgText: string,
    public subject: string,
    public hasRead: boolean,
    public dateTime: any

  ) {}

}
