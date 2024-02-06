import { SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import HackathonService from "../utils/HackathonService";

export const leave_team: Command = {
  data: new SlashCommandBuilder()
    .setName("leave_team")
    .setDescription("Leave your hackathon team!"),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { user, guild } = interaction;
    if (!guild) return;

    const member = await HackathonService.getMember(guild, user);
    if (!member) return;

    if (!(await HackathonService.getTeam(member))) {
      await interaction.editReply(HackathonService.notInTeamMessage());
      return;
    }

    const teamName = await HackathonService.leaveTeam(member);

    try {
      await interaction.editReply(HackathonService.leaveTeamMessage(teamName));
    } catch (e) {
      //
    }
  },
};
