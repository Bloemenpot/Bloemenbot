const {Client, IntentsBitField, AttachmentBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config({path: '.env'});

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
            interaction.reply(`Meme ${interaction.options.getInteger('specific-meme')}:`);
        } else {
            try {
                // interaction.reply('Meme:');
                let file = new AttachmentBuilder(`./videos/10.mp4`);
                interaction.reply({ files: [file] });
            } catch (error) {
                console.log(`An error has occured: \n\n${error}\n\n`)
            }
        }
    }

    if(interaction.commandName === 'info') {
        if(interaction.options.get('meme') != null){
            //info on a specific meme
        } else {
            //global info on sent memes
        }
    }
});

client.login(process.env.DCTOKEN);
