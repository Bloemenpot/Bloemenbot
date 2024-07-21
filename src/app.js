const {
  Client,
  IntentsBitField,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const fs = require("fs");

if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}
if (!fs.existsSync("./data/serverinfo.json")) {
  fs.appendFileSync("./data/serverinfo.json", "[]", function (err) {
    if (err) {
      console.error(err);
    }
  });
}
const JSON_FILE = "./data/serverinfo.json";

let server = {
  id: "",
  serverName: "",
  serverImg: "",
  memes: [],
};

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

function updateMemeCounter(sId, mId) {
  let dataRead = fs.readFileSync(JSON_FILE, {});
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
      if (!memeIds.includes(mId)) {
        let meme = {
          name: mId,
          sent: 1,
        };
        serverData.memes.push(meme);
      }
    }
  });
  data = JSON.stringify(data);
  fs.writeFileSync(JSON_FILE, data);
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
          approvedChannels: [],
          serverName: guild.name,
          serverImg: guild.icon,
          memeCounter: 0,
          memes: [],
        };
        data.push(server);
        console.log("New server added to database!\n");
      } else {
        data.forEach((serverData) => {
          if (serverData.id == guild.id) {
            if (serverData.serverName != guild.name) {
              serverData.serverName = guild.name;
            }
            if (serverData.serverImg != guild.icon) {
              serverData.serverImg = guild.icon;
            }
          }
        });
      }
    });
    data = JSON.stringify(data);
    fs.writeFile(JSON_FILE, data, (error) => {});
  });
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meme") {
    var file = fs.readFileSync(JSON_FILE, {});
    file = JSON.parse(file);
    file.forEach((server) => {
      if (server.id === interaction.guild.id) {
        if (server.approvedChannels.includes(interaction.channel.id)) {
          if (interaction.options.get("specific-meme") != null) {
            let memeNumber = interaction.options.getInteger("specific-meme");
            try {
              if (fs.existsSync(`./memes/${memeNumber}.mp4`)) {
                let file = new AttachmentBuilder(`./memes/${memeNumber}.mp4`);
                interaction.reply({
                  content: `Meme: ${memeNumber}`,
                  files: [file],
                });
                let fileName = file.attachment.replace("./memes/", "");
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
              console.error(`An error has occured: \n\n${error}\n\n`);
              return;
            }
          } else {
            try {
              fs.readdir("./memes/", (err, files) => {
                let amount = 1;
                interaction.deferReply();
                interaction.deleteReply();
                if (interaction.options.get("amount") != null) {
                  amount = interaction.options.getInteger("amount");
                }
                for (let i = 0; i < amount; i++) {
                  setTimeout(() => {
                    let max = files.length - 1;
                    let min = 0;

                    let index = Math.round(Math.random() * (max - min) + min);
                    let file = new AttachmentBuilder(
                      `./memes/${files[index]}`
                    );

                    interaction.channel.send({
                      content: `Meme: ${files[index].split(".")[0]}`,
                      files: [file],
                    });
                    updateMemeCounter(interaction.guild.id, files[index]);
                  }, 500);
                }
              });
            } catch (error) {
              console.error(`An error has occured: \n\n${error}\n\n`);
              return;
            }
          }
        } else {
          interaction.reply({
            content: "This is not a meme approved channel!",
            ephemeral: true,
          });
          return;
        }
      }
    });
  }
  if (interaction.commandName === "info") {
    fs.readFile(JSON_FILE, (error, dataRead) => {
      let data = JSON.parse(dataRead);
      data.forEach((serverData) => {
        if (serverData.id === interaction.guild.id) {
          var res = Math.max.apply(
            Math,
            serverData.memes.map(function (o) {
              return o.sent;
            })
          );
          var obj = serverData.memes.find(function (o) {
            return o.sent == res;
          });
          const embed = new EmbedBuilder()
            .setTitle("Server Info")
            .setDescription("Information about the memes from this server.")
            .setColor("Blue")
            .addFields({ name: "\n", value: " ", inline: false })
            .addFields({
              name: "Total sent memes",
              value: `There have been ${serverData.memeCounter.toString()} memes sent`,
              inline: false,
            })
            .addFields({
              name: "Most sent meme",
              value: `meme ${obj.name} was sent a total of ${obj.sent} times`,
              inline: false,
            })
            .setThumbnail(interaction.guild.iconURL());
          interaction.reply({ embeds: [embed] });
        }
      });
    });
  }

  if (interaction.commandName === "config") {
    if (interaction.options.getBoolean("add-meme-channel")) {
      var file = fs.readFileSync(JSON_FILE, {});
      file = JSON.parse(file);
      file.forEach((serverData) => {
        if (serverData.id === interaction.guild.id) {
          if (serverData.approvedChannels.includes(interaction.channelId)) {
            interaction.reply({
              content: "This channel has already been added!",
              ephemeral: true,
            });
          } else {
            serverData.approvedChannels.push(interaction.channelId);
            interaction.reply("Added this channel as a meme channel!");
          }
        }
      });
      fs.writeFileSync(JSON_FILE, JSON.stringify(file));
    } else {
      var file = fs.readFileSync(JSON_FILE, {});
      file = JSON.parse(file);
      file.forEach((serverData) => {
        if (serverData.id === interaction.guildId) {
          if (serverData.approvedChannels.includes(interaction.channelId)) {
            serverData.approvedChannels = serverData.approvedChannels.filter(
              (e) => e !== interaction.channelId
            );
            interaction.reply("Removed this channel as a meme channel!");
          } else {
            interaction.reply({
              content: "This channel is not a meme channel!",
              ephemeral: true,
            });
          }
        }
      });
      fs.writeFileSync(JSON_FILE, JSON.stringify(file));
    }
  }
});

client.on("messageCreate", (interaction) => {
  if (interaction.content === "meme") {
    var file = fs.readFileSync(JSON_FILE, {});
    file = JSON.parse(file);
    file.forEach((server) => {
      if (server.approvedChannels.includes(interaction.channel.id)) {
        fs.readdir("./memes/", (err, files) => {
          let amount = 1;
          for (let i = 0; i < amount; i++) {
            setTimeout(() => {
              let max = files.length - 1;
              let min = 0;

              let index = Math.round(Math.random() * (max - min) + min);
              let file = new AttachmentBuilder(`./memes/${files[index]}`);

              interaction.channel.send({
                content: `Meme: ${files[index].split(".")[0]}`,
                files: [file],
              });
              updateMemeCounter(interaction.guild.id, files[index]);
            }, 500);
          }
        });
      }
    });
  }
});

client.login(process.env.DCTOKEN);