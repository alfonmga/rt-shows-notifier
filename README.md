# RT.com shows notifier
> Used modules: **Lowdb**, **Request**, **Cheerio** and **node-notifier**.

Current shows supported:
- Keiser Report
- GONZO

## Usage:

1. Clone the repository and install dependencies:
```
git clone https://github.com/alfonmga/rt-shows-notifier
cd rt-shows-notifier/
npm install
```

2. Run `crontab` editor:
```bash
crontab -e
```

3. Add a cron job to `crontab` (below cron job will run every 30 minutes):
```
*/30 * * * * <path-to-node-bin> <rt-shows-notifier-path-dir>/app.js > <rt-shows-notifier-path-dir>/logs/output.log 2> <rt-shows-notifier-path-dir>/logs/error.log
```

## Preview:

![preview](preview.png)


## Why I built this?

@TODO
