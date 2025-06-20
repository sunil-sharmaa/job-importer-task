const cron = require("node-cron");
const { importJobsAndLog } = require("./services/jobFetcherService");

// Multiple URLs to fetch from
const urls = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

const scheduleJobImport = () => {
  // Runs every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("Cron started at", new Date().toLocaleString());

    for (let url of urls) {
      console.log("Importing from:", url);
      await importJobsAndLog(url);
    }

    console.log("All feeds imported at", new Date().toLocaleString());
  });
};

module.exports = scheduleJobImport;
