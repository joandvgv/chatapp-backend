export class APIError extends Error {
  code: number;

  constructor(code: number, msg: string) {
    super(msg);
    Object.setPrototypeOf(this, Error.prototype);

    this.code = code;
  }
}
