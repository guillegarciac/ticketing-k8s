export class DatabaseConnectionError extends Error {
  reason = "Error connecting to database";
  statusCode = 500;
  
  constructor() {
    super();

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
