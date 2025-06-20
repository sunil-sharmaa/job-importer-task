const Bull = require("bull");
require("dotenv").config();

const jobQueue = new Bull("job-import-queue", process.env.REDIS_URL);

module.exports = jobQueue;
