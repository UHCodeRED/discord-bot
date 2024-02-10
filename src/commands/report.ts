import { SlashCommandBuilder } from "@discordjs/builders";
import { TextChannel } from "discord.js";
import { Command } from "../interfaces/Command";
import { createGeneral } from "../utils/embedCreator";

export const report: Command = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("Make a report to the CodeRED officer team!")
    .addStringOption((option) =>
      option
        .setName("report")
        .setDescription("The report that you want to make!")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { user, guild } = interaction;
    if (!guild) return;

    const report = interaction.options.getString("report", true);

    const officerRole =
      guild.roles.cache.find((r) => r.name === "Officer") || "Administrators!";

    const reportMessage = createGeneral(
      "**User Report 📢**",
      `Report from ${user}:\n\n"${report}"`
    )
      .setFooter(null)
      .setTimestamp(null)
      .setColor(0xff0000);

    await interaction.editReply(
      "Your report has been submitted to the CodeRED officer team!"
    );

    const officerChannel = guild.channels.cache.find(
      (c) => c.id === "1202387234880499762"
    ) as TextChannel;
    if (!officerChannel) return;

    const message = await officerChannel.send({
      content: `${officerRole}`,
      embeds: [reportMessage],
    });

    console.log(`${user} sent report ${message.url}`);
  },
};
