const axios = require("axios");
const xml2js = require("xml2js");
const jobQueue = require("../queues/jobQueue");
const ImportLog = require("../models/ImportLog");

const parseXML = async (xmlData) => {
  const parser = new xml2js.Parser({ explicitArray: false, strict: false });
  const result = await parser.parseStringPromise(xmlData);
  return result.rss.channel.item; // array of jobs
};

const fetchJobsFromURL = async (url) => {
  try {
    const res = await axios.get(url);
    const jobs = await parseXML(res.data);
    return jobs;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error.message);
    return [];
  }
};

const addJobsToQueue = async (jobs) => {
  for (let job of jobs) {
    const payload = {
      jobId: job.id,
      title: job.title,
      link: job.link,
      company: job["job_listing:company"],
      location: job["job_listing:location"],
      jobType: job["job_listing:job_type"],
      description: job.description,
      publishedAt: new Date(job.pubDate),
    };

    await jobQueue.add(payload);
  }
};

const importJobsAndLog = async (url) => {
  const jobs = await fetchJobsFromURL(url);

  let newJobs = 0;
  let updatedJobs = 0;
  let failedJobs = [];

  for (let job of jobs) {
    const payload = {
      jobId: job.id,
      title: job.title,
      link: job.link,
      company: job["job_listing:company"],
      location: job["job_listing:location"],
      jobType: job["job_listing:job_type"],
      description: job.description,
      publishedAt: new Date(job.pubDate),
    };

    try {
      const res = await Job.findOneAndUpdate(
        { jobId: payload.jobId },
        { $set: payload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (res.createdAt === res.updatedAt) {
        newJobs++;
      } else {
        updatedJobs++;
      }

    } catch (error) {
      failedJobs.push({ jobId: payload.jobId, error: error.message });
    }
  }

  // Save log
  await ImportLog.create({
    fileName: url,
    timestamp: new Date(),
    totalFetched: jobs.length,
    totalImported: newJobs + updatedJobs,
    newJobs,
    updatedJobs,
    failedJobs,
  });

  return "Import complete ";
};

module.exports = {
  fetchJobsFromURL,
  importJobsAndLog, 
};