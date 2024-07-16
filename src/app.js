const { Client, IntentsBitField, AttachmentBuilder } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const fs = require("fs");

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}
if (!fs.existsSync("./data/serverinfo.json")) {
  fs.appendFileSync("./data/serverinfo.json", "[]", function (err) {
    if (err) { console.error(err); }
  });
}
const JSON_FILE = "./data/serverinfo.json";

let server = {
  id: "",
  serverName: "",
  serverImg: "",
  memes: []
}

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

function updateMemeCounter(sId, mId) {
  fs.readFile(JSON_FILE, (error, dataRead) => {
    let data = JSON.parse(dataRead);
    data.forEach((serverData) => {
      if (serverData.id == sId) { 
        serverData.memeCounter = serverData.memeCounter + 1;
        let memeIds = [];
        serverData.memes.forEach((memeData) => {
          memeIds.push(memeData.name);
          if (memeData.name == mId) {
            memeData.sent = memeData.sent + 1;
          }
        });
        if (!memeIds.includes(mId)){
          let meme = {
            name: mId,
            sent: 1
          }
          serverData.memes.push(meme);
        }
      }
    })
    data = JSON.stringify(data); fs.writeFile(JSON_FILE, data, (error) => {});
  });
  console.log(`Meme sent in ${sId}`);
}

client.on("ready", (c) => {
  console.log("\n\nLogged in as " + `${c.user.tag}` + "& ready to use\n\n");

  fs.readFile(JSON_FILE, (error, dataRead) => {
    let data = JSON.parse(dataRead);
    let serverIdList = [];

    data.forEach((serverData) => {
      serverIdList.push(serverData.id);
    });
    client.guilds.cache.forEach((guild) => {
      if (!serverIdList.includes(guild.id)) {
        console.log("New server found!\nAdding to database!\n");
        server = {
            id: guild.id,
            serverName: guild.name,
            serverImg: guild.icon,
            memeCounter: 0,
            memes: [],
          }
        ;
        data.push(server);
        console.log("New server added to database!\n");
      } else {
        data.forEach((serverData) => {
          if (serverData.id == guild.id){
            if (serverData.serverName != guild.name) { serverData.serverName = guild.name; }
            if (serverData.serverImg != guild.icon) { serverData.serverImg = guild.icon; }
          }
        })
      }
    });
    data = JSON.stringify(data); fs.writeFile(JSON_FILE, data, (error) => {});
  });
});

//read: fs.readfile("data.json" (error, data) => {}); > const x = JSON.parse(data);
//write: const x = JSON.stringify(data); > fs.writefile("data.json", data, (error) => {});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meme") {
    if (interaction.options.get("specific-meme") != null) {
      let memeNumber = interaction.options.getInteger("specific-meme");
      try {
        if (fs.existsSync(`./videos/${memeNumber}.mp4`)) {
          let file = new AttachmentBuilder(`./videos/${memeNumber}.mp4`);
          interaction.reply({ content: `Meme #${memeNumber}:`, files: [file] });
          let fileName = file.attachment.replace('./videos/', '');
          updateMemeCounter(interaction.guild.id, fileName);
          return;
        } else {
          interaction.reply({
            content: `There is no meme with number #${memeNumber}`,
            flags: ["Ephemeral"],
          });
          return;
        }
      } catch (error) {
        console.error(`An error has occured: \n\n${error}\n\n`); return;
      }
    } else {
      try {
        fs.readdir("./videos/", (err, files) => {
          let max = files.length - 1;
          let min = 0;

          let index = Math.round(Math.random() * (max - min) + min);
          let file = new AttachmentBuilder(`./videos/${files[index]}`);
          interaction.reply({ content: `Meme: ${files[index]}`, files: [file] });
          updateMemeCounter(interaction.guild.id, files[index]);
        });
      } catch (error) {
        console.error(`An error has occured: \n\n${error}\n\n`); return;
      }
    }
  }

  if (interaction.commandName === "info") {
    if (interaction.options.get("meme") != null) {
      //info on a specific meme
    } else {
      //global info on sent memes
      //feitjes: wist je dat memebot (1.0) langer in de server zit dan @julia
    }
  }
});

client.login(process.env.DCTOKEN);
