import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import expressSession from 'express-session';
import config from './app/config/env';
import passport from 'passport';
import { router } from './app/routes';
import { globalErrorHandler } from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';
import './app/config/passport'
const app = express();

app.use(
    expressSession({
        secret: config.EXPRESS_SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use('/api/v1', router);

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to Parcel Management System'
    });
});

// error handler
app.use(globalErrorHandler);
app.use(notFound);

export default app;
