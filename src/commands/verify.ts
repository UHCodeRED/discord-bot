import { SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import HackathonService from "../utils/HackathonService";
import { linkDiscordId } from "../utils/supabase";

export const verify: Command = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify your registration for CodeRED!")
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("The email you entered when signing up")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { user, guild } = interaction;
    if (!guild) return;

    const email = interaction.options.getString("email", true);

    const member = await HackathonService.getMember(guild, user);
    if (!member) return;

    const verificationSuccess = await linkDiscordId(email, user);
    if (!verificationSuccess) {
      await interaction.editReply(HackathonService.notVerifiedMessage(email));
      return;
    }

    await interaction.editReply(HackathonService.verifiedMessage());

    const guildRoles = await HackathonService.getGuildRoles(guild);
    if (!guildRoles) return;

    const hackerRole = guildRoles.find(
      (r) => r.name.toLowerCase() === "hacker"
    );
    if (!hackerRole) return;

    await member.roles.add(hackerRole);

    const teamless = await HackathonService.getTeamless(guild);
    if (!teamless) return;
    await member.roles.add(teamless);

    console.log(`${user} verified themself as **${email}**`);
  },
};
