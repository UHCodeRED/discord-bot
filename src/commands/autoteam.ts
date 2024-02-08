import { GuildMember, SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import HackathonService from "../utils/HackathonService";

export const autoteam: Command = {
  data: new SlashCommandBuilder()
    .setName("autoteam")
    .setDescription("Send the auto team role message!")
    .addStringOption((option) =>
      option
        .setName("team_name")
        .setDescription("Your team's name!")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { guild } = interaction;
    if (!guild) return;

    const teamName = interaction.options.getString("team_name", true);

    // Cancel if team name is bad
    if (!HackathonService.teamNameAllowed(teamName)) {
      await interaction.editReply(
        HackathonService.badTeamNameMessage(teamName)
      );
      return;
    }

    const currentRoles = await HackathonService.getGuildRoles(guild);
    if (!currentRoles) return;

    // Cancel if team name is taken
    if (await HackathonService.teamNameTaken(teamName, currentRoles)) {
      await interaction.editReply(
        HackathonService.takenTeamNameMessage(teamName)
      );
      return;
    }

    const role = guild.roles.cache.find(
      (role) => role.name.toLowerCase() === "autoteam"
    );
    if (!role) return;

    if (role.members.size < 2) {
      await interaction.editReply(`Not enough people signed up for AutoTeam!`);
      return;
    }

    const members: GuildMember[] = [];

    while (members.length < 4) {
      const member = role.members.at(Math.random() * role.members.size);
      if (!member) {
        break;
      }

      if (!(await HackathonService.getTeam(member))) {
        members.push(member);
      }

      await member.roles.remove(role);
    }

    const newTeam = await guild.roles.create({
      name: teamName,
      color: HackathonService.getColor(null),
    });

    await HackathonService.addManyToTeam(members, newTeam);

    const logMessage = `${members.slice(0, -1).join(", ")}, and ${members.slice(-1)} have joined ${newTeam} (**${teamName}**) by AutoTeam!`;
    console.log(logMessage);

    await interaction.editReply(
      `AutoTeam Success! Check ${await HackathonService.getTeamChannel(newTeam)}`
    );
  },
};
