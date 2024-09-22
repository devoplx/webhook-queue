import express, { Express, Request, Response } from "express";
import agenda, { stats } from "./queue";
import logger from './logger';

import dotenv from 'dotenv'
dotenv.config();
const app: Express = express();
const port = process.env.PORT
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

app.get('/queue/stats/:license)', (req: Request, res: Response) => {
	const { license } = req.params;
	if (license === licenseKey) {
			res.status(200).json({
					stats
			});
	} else {
			res.status(401).json({
					error: 'Invalid license key'
			});
	}
})



const init = async () => {

	let missingEnv = [];

	if (!process.env.LOGGER_URL) missingEnv.push('LOGGER_URL');
	if (!process.env.MONGODB_URL) missingEnv.push('MONGODB_URL');
	if (!process.env.LOGGER_SECRET) missingEnv.push('LOGGER_SECRET');
	if (!process.env.PORT) missingEnv.push('PORT');

	if (missingEnv.length > 0) {
		await logger.error(`[ENV] Missing environment variables: ${missingEnv.join(', ')}`);
		process.exit(1);
	}

	app.listen(port, async  () => {
		await logger.success(`[SERVER] Server is running at http://localhost:${port}`);
	
	
	});
	await agenda.start();
	await agenda.every('1 minute', 'log-queue-status');
	await logger.info('[AGENDA] Agenda started');
}

init()