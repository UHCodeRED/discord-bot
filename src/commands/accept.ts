import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import { whitelistUser } from "../utils/supabase";

export const accept: Command = {
  data: new SlashCommandBuilder()
    .setName("accept")
    .setDescription("Accept a registrant!")
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
    const whitelistSuccess = await whitelistUser(email);

    if (!whitelistSuccess) {
      await interaction.editReply(
        `There was a problem accepting **${email}**!`
      );
      return;
    }

    await interaction.editReply(`**${email}** has been accepted!`);
    console.log(`${user} accepted **${email}**!`);
  },
};
