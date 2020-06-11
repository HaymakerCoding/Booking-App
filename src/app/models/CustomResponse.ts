
/**
 * Represent an Http response from the server. payload is whatever object we are returning
 * @author Malcolm Roy
 */
export class CustomResponse {

  constructor(
      public status: string | number,
      public payload: (any[] | any)

  ) {}

}
