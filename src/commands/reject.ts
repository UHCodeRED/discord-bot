import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { blacklistUser } from "../utils/supabase";

export const reject: Command = {
  data: new SlashCommandBuilder()
    .setName("reject")
    .setDescription("Reject a registrant!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("Registrant's email!")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const { user } = interaction;

    const email = interaction.options.getString("email", true);
    const blacklistSuccess = await blacklistUser(email);

    if (!blacklistSuccess) {
      await interaction.editReply(
        `There was a problem rejecting **${email}**!`
      );
      return;
    }

    await interaction.editReply(`**${email}** has been rejected!`);
    console.log(`${user} rejected **${email}**!`);
  },
};
