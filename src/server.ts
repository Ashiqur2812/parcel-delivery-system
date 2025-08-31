/* eslint-disable no-console */
import mongoose from "mongoose";
import { Server } from 'http';
import app from './app';
import config from '../src/app/config/env'
import { seedAdmin } from "./app/utils/seedAdmin";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(config.DB_URL);
        console.log('Connected to mongoDB Database');

        server = app.listen(config.PORT, () => {
            console.log(`Server is listening to port ${config.PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
};

(async () => {
    await startServer();
    await seedAdmin()
})();

// gracefully shutdown handlers

process.on('unhandledRejection', (err) => {
    console.error('UnhandledRejection is detected. Shutting down...', err);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error('uncaught exception is detected. Shutting down...', err);
    server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
    console.error('SIGTERM  received...Shutting down gracefully');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.error('SIGINT received. Shutting down gracefully');
    server.close(() => process.exit(0));
});
