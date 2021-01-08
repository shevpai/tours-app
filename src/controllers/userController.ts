import { Request, Response } from 'express';

class UserController {
  getAllUsers(req: Request, res: Response) {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined',
    });
  }
}

export default new UserController();
