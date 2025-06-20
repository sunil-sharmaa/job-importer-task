const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobId: String,
  title: String,
  link: String,
  company: String,
  location: String,
  jobType: String,
  description: String,
  publishedAt: Date,
}, { timestamps: true });

jobSchema.index({ jobId: 1 }, { unique: true });

module.exports = mongoose.model("Job", jobSchema);
