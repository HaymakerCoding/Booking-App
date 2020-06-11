
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
    public hasRead: string, // MySQL boolean is actaully a 1 or 0 char
    public dateTime: any

  ) {}

}
