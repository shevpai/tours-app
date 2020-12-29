import { Application, Request, Response } from 'express';

const express = require('express');
const config = require('config');
const bodyParser = require('body-parser');

const app: Application = express();
const PORT = config.get('port');

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Hello from Node.js server' });
});

app.listen(PORT, () => console.log(`Server is start on port ${PORT}...`));
