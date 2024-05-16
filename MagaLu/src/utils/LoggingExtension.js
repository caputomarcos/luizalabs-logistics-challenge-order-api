/**
 * Function that returns an object with methods for log, info, warn, and error.
 * isEnabled: variable indicating if logging is enabled
 * isProd: variable indicating if the environment is production
 */
function extendedConsole() {
  const isEnabled =
    process.env.LOGGING_ENABLED === "true" ||
    process.env.LOGGING_ENABLED === undefined;
  const isProd =
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === undefined;

  return {
    /**
     * Logs the arguments if logging is enabled and environment is production or development.
     * @param {...any} args - The arguments to be logged
     */
    log(...args) {
      if (isEnabled) {
        if (isProd) {
          console.log(...args);
        } else {
          console.log("[DEV]", ...args);
        }
      }
    },
    /**
     * Logs the arguments as info if logging is enabled and environment is production or development.
     * @param {...any} args - The arguments to be logged as info
     */
    info(...args) {
      if (isEnabled) {
        if (isProd) {
          console.info(...args);
        } else {
          console.info("[DEV]", ...args);
        }
      }
    },
    /**
     * Logs the arguments as warning if logging is enabled and environment is production or development.
     * @param {...any} args - The arguments to be logged as warning
     */
    warn(...args) {
      if (isEnabled) {
        if (isProd) {
          console.warn(...args);
        } else {
          console.warn("[DEV]", ...args);
        }
      }
    },
    /**
     * Logs the arguments as an error if logging is enabled and environment is production or development.
     * @param {...any} args - The arguments to be logged as an error
     */
    error(...args) {
      if (isEnabled) {
        if (isProd) {
          console.error(...args);
        } else {
          console.error("[DEV]", ...args);
        }
      }
    },
  };
}

module.exports = extendedConsole();
