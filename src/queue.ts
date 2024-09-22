import {
    Agenda
} from "@hokify/agenda";
import axios from "axios";
import logger from './logger';
import dotenv from 'dotenv'
dotenv.config();
const mongoConnectionString = process.env.MONGODB_URL;
//@ts-ignore
const agenda = new Agenda({ db: { address: mongoConnectionString }, processEvery: "3 seconds", maxConcurrency: 1, lockLimit: 1},);
let stats = {
		webhookQueue: 0,
		doneInTheLastMin: 0,
		estTimeUntillCompleted: 'done'
}
agenda.define('webhook', async job => {
    const {
        url,
        data
    } = job.attrs.data;


    const res = await axios.post(url, {
        ...data
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const json = res.data
		stats.doneInTheLastMin = stats.doneInTheLastMin + 1;
		
    await job.remove();

}, {

});


function dateToUnix(date: Date) {
	return `<t:${Math.floor(date.getTime() / 1000)}>`;
}


agenda.define('log-queue-status', async (job: any) => {
	try {
			// Get the number of jobs in the queue
			const webhookCount = (await agenda.jobs({ name: 'webhook' }));

			let count = 0;
			for (const webhook of webhookCount) {
				if (webhook.attrs.failReason == undefined || null){
					count++
				}
			}
			const timeMs = count * 3000;
			let time2Done = 'N/A'
			let discordDate = 'N/A'
			if (timeMs !== 0){
				time2Done = new Date(Date.now() + timeMs).toISOString()
				discordDate = dateToUnix(new Date(Date.now() + timeMs))
			}
			stats = {
					webhookQueue: count,
					doneInTheLastMin: stats.doneInTheLastMin,
					estTimeUntillCompleted: time2Done
			}
			// Webhook URL (replace this with the actual webhook URL where you want to send the log)
			const webhookURL = process.env.LOGGER_URL;

			// Create an embed with the queue status
			const embedMessage = {
					embeds: [{
							title: "Webhook Queue Status",
							description: `Current webhook queue status: ${count}\n\nWebhooks done in the last minute: ${stats.doneInTheLastMin}\n\nEstimated time until completed: ${discordDate}`,
							color: 3447003,  // Blue color
							timestamp: new Date().toISOString(),
							footer: {
									text: "Queue Status Logger"
							}
					}]
			};

			// Send the embed message to the Discord webhook
			//@ts-ignore
			await axios.post(webhookURL, embedMessage);

			await logger.notice(`[QUEUE] Webhook queue status: ${count} webhooks in queue, ${stats.doneInTheLastMin} done in the last minute, estimated time until completed: ${stats.estTimeUntillCompleted}`);
			stats.doneInTheLastMin = 0;
	} catch (error) {
		//@ts-ignore
			await logger.error(`[ERROR] Failed to send webhook queue status: ${error.message}`);
	}
});
export default agenda
export {stats}