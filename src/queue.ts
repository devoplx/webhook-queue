import { Agenda } from "@hokify/agenda";
import axios from "axios";
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();

const mongoConnectionString = process.env.MONGODB_URL;
//@ts-ignore
const agenda = new Agenda({ db: { address: mongoConnectionString }, processEvery: "3 seconds", maxConcurrency: 1, lockLimit: 1 });

let stats = {
    webhookQueue: 0,
    doneInTheLastMin: 0,
    estTimeUntilCompleted: 'done'
};

// Job for sending webhooks
agenda.define('webhook', async job => {
    const { url, data } = job.attrs.data;

    try {
        const res = await axios.post(url, data, { headers: { 'Content-Type': 'application/json' } });
        stats.doneInTheLastMin += 1;
        await job.remove();
    } catch (error) {
			//@ts-ignore
        logger.error(`[WEBHOOK] Failed to send to ${url}: ${error.message}`);
				await job.remove();
    }
});

// Function to format date to Unix timestamp for Discord
function dateToUnix(date: Date) {
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
}

// Job for logging queue status
agenda.define('log-queue-status', async job => {
    try {
        const webhookCount = await agenda.jobs({ name: 'webhook' });
        const count = webhookCount.filter(job => !job.attrs.failReason).length;

        const timeMs = count * 3000;
        let timeUntilDone = 'N/A';
        let discordDate = 'N/A';

        if (timeMs !== 0) {
            timeUntilDone = new Date(Date.now() + timeMs).toISOString();
            discordDate = dateToUnix(new Date(Date.now() + timeMs));
        }

        stats = { webhookQueue: count, doneInTheLastMin: stats.doneInTheLastMin, estTimeUntilCompleted: timeUntilDone };

        const webhookURL = process.env.LOGGER_URL;
        const embedMessage = {
            embeds: [{
                title: "Webhook Queue Status",
                description: `Current webhook queue status: ${count}\n\nWebhooks done in the last minute: ${stats.doneInTheLastMin}\n\nEstimated time until completed: ${discordDate}`,
                color: 3447003, // Blue color
                timestamp: new Date().toISOString(),
                footer: { text: "Queue Status Logger" }
            }]
        };

				//@ts-ignore
        await axios.post(webhookURL, embedMessage);
        await logger.notice(`[QUEUE] Webhook queue status: ${count} webhooks in queue, ${stats.doneInTheLastMin} done in the last minute, estimated time until completed: ${stats.estTimeUntilCompleted}`);
        stats.doneInTheLastMin = 0;
    } catch (error) {
			//@ts-ignore
        await logger.error(`[ERROR] Failed to send webhook queue status: ${error.message}`);
				await job.remove()
    }
});

export default agenda;
export { stats };
