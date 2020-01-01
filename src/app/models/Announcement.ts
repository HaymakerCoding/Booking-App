
/**
 * Represent a booiking app annoucment, html/text for display in UI
 * @author Malcolm Roy
 */
export class Announcement {

  constructor(
      public id: number,
      public text: string,
      public updatedBy: number,
      public updatedAt: string,
      public updatedByName: string

  ) {}

}
