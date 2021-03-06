// Imports
const dotenv = require("dotenv");
const Telegraf = require("telegraf");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

// Load config
dotenv.config({ path: ".env" });

// Initialize the telegram API
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

//Set Download Directory and create it if it does not exist
var downloadDir = process.env.DOWNLOAD_DIR;

if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

// Download video and return to user
function getVid(tiktok_url, ctx) {
  axios
    .get(tiktok_url)
    .then(response => {
      console.log("Page retrieved!");
      let video = JSON.parse(
        "{" + response.data.match(/"urls":\s*?\[.+?\]/g) + "}"
      ).urls[0];
      video_key = tiktok_url.substring(21, tiktok_url.length - 1);
      axios({
        method: "get",
        url: video,
        responseType: "stream"
      }).then(function(response) {
        response.data.pipe(
          fs.createWriteStream(downloadDir + "/" + video_key + ".mp4")
        );
        console.log("DL Successful");
        ctx.reply("👍");
      });
    })
    .catch(error => console.log(error));
}

// Take in message and validate
bot.on("text", ctx => {
  console.log(ctx.update.message.from.id);
  if (ctx.update.message.from.id == process.env.RESTRICT_USER) {
    video_url = ctx.update.message.text;
    console.log(video_url);
    if (video_url.match(/https?:\/\/vm.tiktok.com\/.*\//g)) {
      console.log("Attempting DL");
      var resp = getVid(video_url, ctx);
    }
  }
});
bot.launch();
