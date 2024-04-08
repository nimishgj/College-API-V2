const fs = require("fs");
const logModel = require("../models/Log.model"); // Replace with the actual path to your ErrorModel file
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const Users = require("../models/User.model");

const { log } = require("../middleware/logger/logger");
const { sendError, sendServerError } = require("../util/Responses");

const { RESPONSE_MESSAGE} = require("../constants/Logs")
const { CONTROLLER} = require("../constants/Logs")

const { LOG_TYPE } = require("../constants/LogType");

exports.sendLogFile = async (request, response) => {
  try {
    const userId = request.user._id.toString();
    const user = await Users.findById({ _id: userId });
    const logs = await logModel.find({});

    if (logs.length === 0) {
      sendError(response, "No Logs found");
    }

    const csvWriter = createCsvWriter({
      path: "logs.csv",
      header: [
        { id: "logInfo", title: "logInformatio" },
        { id: "filename", title: "filename" },
        { id: "createdAt", title: "Date" },
        { id: "type", title: "type" },
        { id: "level", title: "level" },
        { id: "context", title: "context" },
      ],
    });

    log(
      request,
      `${user.name} Downloaded the Log File`,
      CONTROLLER.SEND_LOG_FILE,
      LOG_TYPE.REQUEST,
      "info"
    );

    const logsWithAdditionalContext = logs.map((log) => {
      const context = `IP: ${log.context.ip}, Country: ${log.context.country}, City: ${log.context.city}, Device Type: ${log.context.deviceType}, Browser: ${log.context.browser}, Platform: ${log.context.platform}, OS: ${log.context.os}, Device: ${log.context.device}`;
      return {
        logInfo: log.logInfo,
        filename: log.filename,
        createdAt: log.createdAt,
        type: log.type,
        level: log.level,
        context,
      };
    });

    csvWriter
      .writeRecords(logs)
      .then(() => {
        response.setHeader("Content-Type", "text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=logs.csv");

        const fileStream = fs.createReadStream("logs.csv");
        fileStream.pipe(response);

        fileStream.on("end", () => {
          fs.unlinkSync("logs.csv");
        });
      })
      .catch((error) => {
        console.log(error);
        log(
          request,
          RESPONSE_MESSAGE.DOWNLOAD_ERROR,
          CONTROLLER.SEND_LOG_FILE_CSV,
          "api request",
          "error"
        );
        sendServerError(response);
      });
  } catch (error) {
    console.log(error);
    log(
      request,
      RESPONSE_MESSAGE.DOWNLOAD_ERROR,
      CONTROLLER.SEND_LOG_FILE,
      LOG_TYPE.REQUEST,
      "error"
    );
    sendServerError(response);
  }
};

exports.getRecentLogs = async (request, response) => {
  try {
    const userId = request.user._id.toString();

    const user = await Users.findById({ _id: userId });

    const logs = await logModel.find({}).sort({ _id: -1 }).limit(10);
    if (logs.length === 0) {
      sendError(response, "No Logs found");
    }

    log(
      request,
      `${user.name} Fetched Recent 10 Logs`,
      CONTROLLER.GET_RECENT_LOGS,
      LOG_TYPE.REQUEST,
      "info"
    );

    response.status(200).json({ success: true, logs });
  } catch (error) {
    log(
      request,
      RESPONSE_MESSAGE.FETCH_ERROR,
      CONTROLLER.GET_RECENT_LOGS,
      LOG_TYPE.REQUEST,
      "error"
    );
    sendServerError(response);
  }
};
