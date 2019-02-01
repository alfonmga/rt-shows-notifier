const request = require("request");
const notifier = require("node-notifier");
const cheerio = require("cheerio");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const log = require("simple-node-logger").createSimpleLogger({
  logFilePath: `${__dirname}/logs.log`,
  timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS"
});

const adapter = new FileSync(`${__dirname}/db.json`);
const db = low(adapter);

db.defaults({ shows: [] }).write();

const TARGET_SHOWS = [
  {
    id: 1,
    name: "Keiser Report",
    scrapeUrl: "https://www.rt.com/shows/keiser-report",
    scrapeSelector: 'a[href^="/shows/keiser-report/"]',
    img: "keiser-report.jpg"
  },
  {
    id: 2,
    name: "GONZO",
    scrapeUrl: "https://www.rt.com/shows/gonzo",
    scrapeSelector: 'a[href^="/shows/gonzo/"]',
    img: "gonzo.jpg"
  }
];

TARGET_SHOWS.forEach(show => {
  request(show.scrapeUrl, function(err, response, body) {
    if (err) return log.error(err.message);

    if (response.statusCode === 200) {
      const $ = cheerio.load(body);

      const latestShow = $("body").find(show.scrapeSelector);
      const latestShowRelativeUrl = latestShow.attr("href");
      const latestShowTitle = latestShow.html().trim();

      const LATEST_SHOW_URL = `https://www.rt.com${latestShowRelativeUrl}`;

      const lastShowDb = db
        .get("shows")
        .find({ id: show.id })
        .value();

      if (!lastShowDb || lastShowDb.url !== LATEST_SHOW_URL) {
        if (!lastShowDb) {
          db.get("shows")
            .push({ id: show.id, url: LATEST_SHOW_URL })
            .write();
        } else {
          db.get("shows")
            .find({ id: show.id })
            .assign({ url: LATEST_SHOW_URL })
            .write();
        }

        log.info(`${show.name} – ${latestShowTitle} – ${LATEST_SHOW_URL}`);

        notifier.notify(
          {
            title: show.name,
            subtitle: latestShowTitle,
            message: "Click to watch now",
            sound: "Glass",
            open: LATEST_SHOW_URL,
            icon: `${__dirname}/images/${show.img}`,
            wait: true,
            timeout: 3600
          },
          function(err) {
            if (err) log.error(err.message);
          }
        );
      }
    }
  });
});
