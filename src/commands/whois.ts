import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { Command } from "../interfaces/Command";
import {
  getWhitelistRecordByEmail,
  getWhitelistRecordByUser,
} from "../utils/supabase";

export const whois: Command = {
  data: new SlashCommandBuilder()
    .setName("whois")
    .setDescription("See who somebody is!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("user")
        .setDescription("See who somebody is by discord user!")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Person's discord user!")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("email")
        .setDescription("See who somebody is by email!")
        .addStringOption((option) =>
          option
            .setName("email")
            .setDescription("Person's email!")
            .setRequired(true)
        )
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { user } = interaction;

    const subcommand = interaction.options.getSubcommand();

    let data: { email: string; discord_id?: string } | undefined;
    if (subcommand === "user") {
      const whoisUser = interaction.options.getUser("user", true);

      const userResponse = await getWhitelistRecordByUser(whoisUser);
      if (
        userResponse.error ||
        !userResponse.data ||
        !userResponse.data.length
      ) {
        await interaction.editReply("There was an error finding the user!");
        return;
      }

      data = userResponse.data[0];
    } else {
      const email = interaction.options.getString("email", true);

      const userResponse = await getWhitelistRecordByEmail(email);
      if (
        userResponse.error ||
        !userResponse.data ||
        !userResponse.data.length
      ) {
        await interaction.editReply("There was an error finding the user!");
        return;
      }

      data = userResponse.data[0];
    }

    if (!data) return;

    await interaction.editReply(
      `Email: \`${data.email}\` \nUser: <@${data.discord_id}>`
    );

    console.log(
      `${user} used whois to find \`${data.email}\`, <@${data.discord_id}>!`
    );
    return;
  },
};
