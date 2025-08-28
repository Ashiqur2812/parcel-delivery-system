import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Parcel Management System'
    });
});

export default app;