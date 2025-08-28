import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan'
import express, { Request, Response } from 'express';
const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); 

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Parcel Management System'
    });
});

export default app;