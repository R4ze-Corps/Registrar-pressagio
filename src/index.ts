import { env } from "#env";
import { bootstrap } from "@constatic/base";
import { GatewayIntentBits } from "discord.js";

await bootstrap({
    meta: import.meta,
    env,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});