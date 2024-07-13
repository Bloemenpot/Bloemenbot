const {Client, IntentsBitField, AttachmentBuilder } = require('discord.js');
const dotenv = require('dotenv');
const fs = require("fs");
dotenv.config({path: '.env'});

if (!fs.existsSync('./data/serverinfo.json')){
    fs.appendFile('./data/serverinfo.json', '', function (err) {
        if (err) {
          // append failed
        } else {
          // done
        }
    })
}



const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) => {
    console.log("Logged in as " + `${c.user.tag}` + "& ready to use");
})

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'meme') {
        if(interaction.options.get('specific-meme') != null){
            let memeNumber = interaction.options.getInteger('specific-meme');
            try {
                if(fs.existsSync(`./videos/${memeNumber}.mp4`)){
                    let file = new AttachmentBuilder(`./videos/${memeNumber}.mp4`);
                    interaction.reply({ content:`Meme #${memeNumber}:`, files: [file] });
                    return;
                } else {
                    interaction.reply({ content:`There is no meme with number #${memeNumber}`, flags: ["Ephemeral"] });
                    return;
                }
            } catch (error) {
                console.log(`An error has occured: \n\n${error}\n\n`);
            }
        } else {
            try {
                fs.readdir("./videos/", (err, files) => {
                    let max = files.length - 1;
                    let min = 0;

                    let index = Math.round(Math.random() * (max - min) + min);
                    let file = new AttachmentBuilder(`./videos/${files[index]}`);
                    interaction.reply({ content:"Meme:", files: [file] });
                });
            } catch (error) {
                console.log(`An error has occured: \n\n${error}\n\n`);
            }
        }
    }

    if(interaction.commandName === 'info') {
        if(interaction.options.get('meme') != null){
            //info on a specific meme
        } else {
            //global info on sent memes

            //feitjes: wist je dat memebot (1.0) langer in de server zit dan @julia
        }
    }
});

client.login(process.env.DCTOKEN);
