import { SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";

export const help: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Learn about the public commands for this bot!"),
  run: async (interaction) => {
    const commandGuide = `# CodeRED Bot Commands
- \`/create_team\`: Creates a new role and channel for your Hackathon Team.
- \`/leave_team\`: Removes you from your current team. If you are the last member, then the team will be permanently deleted.
- \`/rename_team\`: Allows you to rename your CodeRED Genesis team.
- \`/invite\`: Allows you to send an invite for your team to another Hacker.
- \`/promote\`: Sends a promotion message to allow any Hacker to join your team.
- \`/report\`: Lets you send a report to the CodeRED Officer Team for emergencies or other critical issues.`;

    await interaction.reply({
      ephemeral: true,
      content: commandGuide,
    });
  },
};
