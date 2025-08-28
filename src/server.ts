/* eslint-disable no-console */
import mongoose from "mongoose";
import { Server } from 'http';
import app from './app';
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL);
        console.log('Connected to DB');

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listening to port ${envVars.PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
};

(async () => {
    await startServer();
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
