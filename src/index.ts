import express, { Express, Request, Response } from "express";
import agenda from "./queue";
import logger from './logger';

import dotenv from 'dotenv'
dotenv.config();
const app: Express = express();
const port = 4011
const licenseKey = process.env.LOGGER_SECRET

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.json({
        error: 'Wrong endpoint',
        endpoints: {
            "Add to the queue": '/webhook/addqueue',
        }
    })
});

app.post('/webhook/addqueue/:license/:id/:token', (req: Request, res: Response) => {
	const { license, token, id } = req.params;
	const data = req.body;  // Keep `data` in the request body for more flexibility
	const url = `https://discord.com/api/webhooks/${id}/${token}`
	if (license === licenseKey) {
			res.status(200).json({
					message: 'Added to queue'
			});

			agenda.now('webhook', {
					url,  // Decode webhook URL from the path parameter
					data
			});
	} else {
			res.status(401).json({
					error: 'Invalid license key'
			});
	}
});


// sigma sigma on the wall whos the skibidiest of them all
// if you are skibidiest of them all then you are the sigma



const init = async () => {

	let missingEnv = [];

	if (!process.env.LOGGER_URL) missingEnv.push('LOGGER_URL');
	if (!process.env.MONGODB_URL) missingEnv.push('MONGODB_URL');
	if (!process.env.LOGGER_SECRET) missingEnv.push('LOGGER_SECRET');

	if (missingEnv.length > 0) {
		await logger.error(`[ENV] Missing environment variables: ${missingEnv.join(', ')}`);
		process.exit(1);
	}

	app.listen(port, async  () => {
		await logger.success(`[SERVER] Server is running at http://localhost:${port}`);
	
		await agenda.start();
		agenda.every('1 minute', 'log-queue-status');
		await logger.info('[AGENDA] Agenda started');
	});
}

init()