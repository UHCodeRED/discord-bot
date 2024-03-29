import { REST } from "@discordjs/rest";
import { Client, PresenceStatusData, TextChannel } from "discord.js";
import { Routes } from "discord-api-types/v10";
import { CommandList } from "../utils/_Commandlist";
import config from "../config/config.json";
import "dotenv/config";

export const onReady = async (client: Client) => {
  const rest = new REST({ version: "10" }).setToken(
    process.env.TOKEN as string
  );

  const commandData = CommandList.map((command) => command.data.toJSON());

  console.log("🔨 Started loading (/) commands.");

  await client.guilds.fetch();
  const guilds = client.guilds.cache;

  let logChannel: TextChannel | undefined;

  for (const guildEntry of guilds) {
    const guild = guildEntry[1];
    await rest.put(
      Routes.applicationGuildCommands(
        client.user?.id || "missing id",
        guild.id
      ),
      { body: commandData }
    );

    const channelFound = guild.channels.cache.find(
      (ch) => ch.id === "1202387313083306034"
    ) as TextChannel | undefined;

    logChannel = logChannel || channelFound;
  }

  const oldLog = console.log;

  console.log = (logString: string) => {
    oldLog(logString);
    const logMessage = `\`[${new Date().toLocaleString()}]\`\t${logString}`;
    logChannel && logChannel.send({ content: logMessage, embeds: [] });
  };

  console.log("✅ Successfully loaded (/) commands.");

  client.user?.setPresence({
    activities: [
      {
        type: config.activityType,
        name: config.activityMessage,
      },
    ],
    status: config.status as PresenceStatusData,
  });
  console.log(
    `🗣️  Activity set to ${config.activityType} "${config.activityMessage}" with status ${config.status}`
  );

  console.log(`🤖 ${client.user?.tag} is online ⚡`);
  console.log("🪐 Initialization complete\n");

  console.log("Guild List:");
  client.guilds.cache.forEach((guild) => {
    console.log(guild.name);
  });

  process.on("uncaughtException", async (error) => {
    console.log(`@ben.json THE BOT HAS SHUT DOWN!`);
    console.log(error.stack);
    process.exit(1);
  });
};
