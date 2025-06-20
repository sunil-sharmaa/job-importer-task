const mongoose = require("mongoose");
const Job = require("../models/job");

const processJob = async (job) => {
  const data = job.data;

  try {
    const updated = await Job.findOneAndUpdate(
      { jobId: data.jobId },
      { $set: data },
      { upsert: true, new: true }
    );

    return { success: true };
  } catch (err) {
    console.error("Job save failed:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = processJob;

