export class AppError extends Error {
  public status: string;
  public isOperational: boolean;

  constructor(public message: string, public statusCode?: number) {
    super(message);

    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ResponseError extends AppError {
  path?: string;
  value?: string;
  code?: number;
  // errmsg?: string;
  keyValue?: { name: string };
  // errors?: {
  //   error: { message: string };
  // };
  _message?: string;
}
