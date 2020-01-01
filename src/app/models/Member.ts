
/**
 * Represent a ClubEG member
 * @author Malcolm Roy
 */
export class Member {

  constructor(
      public id: number,
      public firstName: string,
      public lastName: string,
      public email: string,
      public altEmail: string,
      public memberCompetition: string,
      public memberSince: string,
      public isAdmin: boolean,
      public avgScore: number,
      public pic: Blob,
      public membership: string,
      public memberbookadvance: string,
      public membersex: string,
      public memberbirthdate: string,
      public homePhone: string,
      public cellPhone: string,
      public memberRoundsPerYear: number,
      public memberAverageScore: number,
      public address: string,
      public city: string,
      public province: string,
      public postal: string,
      public competitionPref: string,
      public daysAbleToPlay: string,
      public memberNumber: number

  ) {}

}
