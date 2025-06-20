const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectRedis = require('./config/redis');
const { fetchJobsFromURL, importJobsAndLog } = require('./services/jobFetcherService');
const jobQueue = require("./queues/jobQueue");
const processJob = require("./workers/jobWorker");
const scheduleJobImport = require('./cronJobs');
const cors = require('cors');

dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

// Routes will go here later

const PORT = process.env.PORT || 5000;

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Redis connect
connectRedis();

app.get("/test-fetch", async (req, res) => {
  const url = "https://jobicy.com/?feed=job_feed";
  const result = await importJobsAndLog(url);
  res.send(result);
});

const ImportLog = require('./models/ImportLog');

app.get("/api/import-logs", async (req, res) => {
  try {
    const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error("Failed to fetch import logs:", err.message);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});


jobQueue.process(async (job) => {
  return await processJob(job);
});

scheduleJobImport();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
