import {
    Agenda
} from "@hokify/agenda";
import axios from "axios";
import logger from './logger';

const mongoConnectionString = process.env.MONGODB_URL;
//@ts-ignore
const agenda = new Agenda({ db: { address: mongoConnectionString }, processEvery: "3 seconds", maxConcurrency: 1, lockLimit: 1},);

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
		
    await job.remove();

}, {

});
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
			// Webhook URL (replace this with the actual webhook URL where you want to send the log)
			const webhookURL = process.env.LOGGER_URL;

			// Create an embed with the queue status
			const embedMessage = {
					embeds: [{
							title: "Webhook Queue Status",
							description: `Current number of webhooks in the queue: **${count}**`,
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

			await logger.notice(`[LOG] Sent webhook queue status: ${count}`);
	} catch (error) {
		//@ts-ignore
			await logger.error(`[ERROR] Failed to send webhook queue status: ${error.message}`);
	}
});
export default agenda