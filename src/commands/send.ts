import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";

export const send: Command = {
  data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Send a message as your discord bot!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Your discord bot message!")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { channel } = interaction;
    if (!channel) return;

    const message = `${interaction.options.getString("message", true)}`;

    await channel.send(message);
    await interaction.editReply("Successfully sent your message!");
  },
};
