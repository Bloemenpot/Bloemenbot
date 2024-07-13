const dotenv = require('dotenv');
dotenv.config({path: '.env'});
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'meme',
        description: 'Sends a random meme from a database of over 100 meme videos!',
        options: [
            {
                name: 'specific-meme',
                description: 'For if you are looking for a specific meme',
                type: ApplicationCommandOptionType.Integer,
                required: false,
            }
        ]
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DCTOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID, 
                process.env.GUILD_ID_TESTING,
            ),
            {body: commands }
        );

        console.log('Slash commands are ready to be used!');
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();