import { SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import HackathonService from "../utils/HackathonService";

export const create_team: Command = {
  data: new SlashCommandBuilder()
    .setName("create_team")
    .setDescription("Create a new hackathon team!")
    .addStringOption((option) =>
      option
        .setName("team_name")
        .setDescription("Your team's name!")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("color_hex")
        .setDescription("Your team's color in hexadecimal! Ex: FF0000")
        .setRequired(false)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const teamName = interaction.options.getString("team_name", true);
    const colorHex = interaction.options.getString("color_hex", false);
    const color = HackathonService.getColor(colorHex);

    const { user, guild } = interaction;
    if (!guild) return;

    const member = await HackathonService.getMember(guild, user);
    if (!member) return;

    const currentTeam = await HackathonService.getTeam(member);
    if (currentTeam) {
      await interaction.editReply(
        HackathonService.alreadyInTeamMessage(currentTeam)
      );
      return;
    }

    if (!(await HackathonService.teamNameAllowed(teamName))) {
      await interaction.editReply(
        HackathonService.badTeamNameMessage(teamName)
      );
      return;
    }

    const currentRoles = await HackathonService.getGuildRoles(guild);
    if (!currentRoles) return;

    if (await HackathonService.teamNameTaken(teamName, currentRoles)) {
      await interaction.editReply(
        HackathonService.takenTeamNameMessage(teamName)
      );
      return;
    }

    const newTeam = await guild.roles.create({
      name: teamName,
      color,
    });

    console.log(`${user} has created ${newTeam} (**${teamName}**).`);

    await HackathonService.addToTeam(member, newTeam);
    await interaction.editReply(await HackathonService.newTeamMessage(newTeam));
  },
};
