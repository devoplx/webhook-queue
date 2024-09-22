import winston, { createLogger, format, transports } from "winston";
import { consoleFormat } from "winston-console-format";
import EventEmitter from 'events';

// Increase the defaultMaxListeners for EventEmitter globally
EventEmitter.defaultMaxListeners = 20; // Adjust this number as needed

// Define custom levels and their corresponding colors
const myCustomLevels = {
  levels: {
    ...winston.config.npm.levels,
    fatal: 0,      // Adjusting "fatal" level for consistency
    critical: 1,
    emerg: 2,
    alert: 3,
    notice: 4,
    success: 5,
    prompt: 6,
  },
  colors: {
    ...winston.config.npm.colors,
    fatal: 'white bold bgRed',    // Customizing colors with background for certain levels
    critical: 'white bold bgMagenta',
    emerg: 'white bold bgRed',
    alert: 'red',
    error: 'red',
    warn: 'yellow',
    notice: 'white bold',
    info: 'green',
    success: 'white bold bgGreen', // Background color for success
    prompt: 'blue',
  },
};

// Extend winston module to include custom levels

// Filter function to create a custom filter for each level
const levelFilter = (level: string) => format((info) => {
  return info.level === level ? info : false;
})();



// Configure the logger
const log = createLogger({
  levels: myCustomLevels.levels,
  level: "prompt", // Set default level here if needed
  format: format.combine(
    format.timestamp(),
    format.ms(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
//   defaultMeta: { system: "main" },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.padLevels({
          levels: myCustomLevels.levels,
        }),
        consoleFormat({
          showMeta: true,
          inspectOptions: {
            depth: Infinity,
            colors: true,
            maxArrayLength: Infinity,
            breakLength: 120,
            compact: Infinity,
          },
        })
      ),
    }),
  ],
}) as winston.Logger & Record<keyof typeof myCustomLevels['levels'], winston.LeveledLogMethod>;

// Add custom colors to the logger
winston.addColors(myCustomLevels.colors);



const logger = {
	info: log.info.bind(log),
	error: log.error.bind(log),
	warn: log.warn.bind(log),
	debug: log.debug.bind(log),
	verbose: log.verbose.bind(log),
	silly: log.silly.bind(log),
	success: log.success.bind(log),
	critical: log.critical.bind(log),
	emerg: log.emerg.bind(log),
	alert: log.alert.bind(log),
	notice: log.notice.bind(log),
	prompt: log.prompt.bind(log),
	child: (options: object) => {
		return log.child(options);
	},
}

export default logger;