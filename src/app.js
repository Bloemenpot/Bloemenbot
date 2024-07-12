const {Client, IntentsBitField } = require('discord.js');
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
client.login(process.env.DCTOKEN);
console.log("Logged in");