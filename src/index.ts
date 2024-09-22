import express, { Express, Request, Response } from "express";
import agenda, { stats } from "./queue";
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT; // Default to 3000 if not specified
const licenseKey = process.env.LOGGER_SECRET;

app.use(express.json());

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({
        error: 'Wrong endpoint',
        endpoints: {
            "Add to the queue": '/webhook/addqueue',
        }
    });
});

// Add to queue endpoint
app.post('/webhook/addqueue/:license/:id/:token', (req: Request, res: Response) => {
    const { license, token, id } = req.params;
    const data = req.body; // Keep `data` in the request body for flexibility
    const url = `https://discord.com/api/webhooks/${id}/${token}`;

    if (license === licenseKey) {
        agenda.now('webhook', { url, data });
        return res.status(200).json({ message: 'Added to queue' });
    } else {
        return res.status(401).json({ error: 'Invalid license key' });
    }
});

// Queue stats endpoint
app.get('/queue/stats/:license', (req: Request, res: Response) => {
    const { license } = req.params;

    if (license === licenseKey) {
        return res.status(200).json({ stats });
    } else {
        return res.status(401).json({ error: 'Invalid license key' });
    }
});

// Initialize server and check for required environment variables
const init = async () => {
    const missingEnv = ['LOGGER_URL', 'MONGODB_URL', 'LOGGER_SECRET', 'PORT']
        .filter(varName => !process.env[varName]);

    if (missingEnv.length > 0) {
        await logger.error(`[ENV] Missing environment variables: ${missingEnv.join(', ')}`);
        process.exit(1);
    }

    app.listen(port, async () => {
        await logger.success(`[SERVER] Server is running at http://localhost:${port}`);
    });

    await agenda.start();
    await agenda.every('1 minute', 'log-queue-status');
    await logger.info('[AGENDA] Agenda started');
};

init();
