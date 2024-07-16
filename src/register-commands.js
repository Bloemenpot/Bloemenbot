const dotenv = require('dotenv');
dotenv.config({path: '.env'});
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'meme',
        description: 'Sends a random meme from a database of over 100 meme videos!',
        choises: [{
            name: 'specific-meme',
            value: 3
        }],
        options: [
            {
                name: 'specific-meme',
                description: 'For if you are looking for a specific meme.',
                type: ApplicationCommandOptionType.Integer,
                required: false,
            },
            {
                name: 'amount',
                description: 'Send multiple memes.',
                type: ApplicationCommandOptionType.Integer,
                max_value: 10,
                required: false,
            }
        ]
    },
    {
        name: 'info',
        description: 'Shows information & statistics from the bot.'
    },
    {
        name: 'config',
        description: 'Change settings from the bot.',
        options: [
            {
                name: 'add-meme-channel',
                description: "Add or remove a channel for memes.",
                type: ApplicationCommandOptionType.Boolean,
                required: false,
            }
        ]
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DCTOKEN);

(async () => {
    try {
        console.log(`Registering ${commands.length} slash commands...`);

        const data = await rest.put(
            Routes.applicationCommands( process.env.CLIENT_ID ),
            {body: commands },
        );

        console.log(`${data.length} slash commands are ready to be used!`);
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();