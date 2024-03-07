const logModel = require("../../models/Log.model");
const getCurrentContextData = require("../../util/ContextData");

/**
 * Saves log info to the database
 * @param req - request object
 * @param logInfo {string} - log message
 * @param type {string} - log type (sign in, sign out, api requests)
 * @param level {string} - log level (error, warning, info)
 */

exports.log = async (req, logInfo, filename, type, level) => {
  try {
    let context = null;
    if (req) {
      const { ip, country, city, browser, platform, os, device, deviceType } =
        getCurrentContextData(req);

      context = `IP: ${ip}, Country: ${country}, City: ${city}, Device Type: ${deviceType}, Browser: ${browser}, Platform: ${platform}, OS: ${os}, Device: ${device}`;
    }

    const log = new logModel({
      context,
      logInfo,
      type,
      level,
      filename,
    });

    await log.save();
  } catch (error) {
    console.log(error);
  }
};
