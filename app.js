const request = require("request");
const notifier = require("node-notifier");
const cheerio = require("cheerio");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

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
    if (err) throw err;

    if (response.statusCode === 200) {
      const $ = cheerio.load(body);

      const latestShow = $("body").find(show.scrapeSelector);
      const latestShowRelativeUrl = latestShow.attr("href");
      const latestShowTitle = latestShow.html().trim();

      const lastShowNotified = db
        .get("shows")
        .find({ id: show.id, lastUrl: latestShowRelativeUrl })
        .value();

      if (!lastShowNotified) {
        db.get("shows")
          .push({ id: show.id, lastUrl: latestShowRelativeUrl })
          .write();

        const date = new Date();
        console.log(
          `${date.toLocaleDateString()} ${date.toLocaleTimeString()} ${
            show.name
          } – ${latestShowTitle}`
        );

        notifier.notify(
          {
            title: show.name,
            subtitle: latestShowTitle,
            message: "Click to watch now",
            sound: "Glass",
            open: `https://www.rt.com${latestShowRelativeUrl}`,
            icon: `${__dirname}/images/${show.img}`,
            wait: true,
            timeout: 3600
          },
          function(err) {
            if (err) throw err;
          }
        );
      }
    }
  });
});
