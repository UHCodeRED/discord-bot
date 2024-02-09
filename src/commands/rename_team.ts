import { SlashCommandBuilder } from "@discordjs/builders";
import HackathonService from "../utils/HackathonService";
import { Command } from "../interfaces/Command";

export const rename_team: Command = {
  data: new SlashCommandBuilder()
    .setName("rename_team")
    .setDescription("Change your team's name!")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name you want to change your team to.")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const { user, guild } = interaction;
    if (!guild) return;

    const newTeamName = interaction.options.getString("name", true);

    const member = await HackathonService.getMember(guild, user);
    if (!member) return;

    // Cancel if not in a team
    const currentTeam = await HackathonService.getTeam(member);
    if (!currentTeam) {
      await interaction.editReply(HackathonService.notInTeamMessage());
      return;
    }

    // Cancel if team name isn't found
    if (!newTeamName) {
      await interaction.editReply("You must have a valid team name!");
      return;
    }

    // Cancel if team name is forbidden
    if (!HackathonService.teamNameAllowed(newTeamName)) {
      await interaction.editReply(
        HackathonService.badTeamNameMessage(newTeamName)
      );
      return;
    }

    // Cancel if team name is taken
    const teams = await HackathonService.getTeams(guild);
    if (teams) {
      // Cancel if team name is taken
      if (await HackathonService.teamNameTaken(newTeamName, teams)) {
        await interaction.editReply(
          HackathonService.takenTeamNameMessage(newTeamName)
        );
        return;
      }
    }

    const teamChannel = await HackathonService.getTeamChannel(currentTeam);
    if (!teamChannel) {
      await interaction.editReply(
        `Sorry, there was an error with your request.`
      );
      return;
    }
    const oldTeamName = currentTeam.name;
    teamChannel.edit({ name: newTeamName });
    currentTeam.edit({ name: newTeamName });

    await interaction.editReply(
      `Success! Changed team name to **${newTeamName}**!`
    );

    await teamChannel.send(
      `Team name changed from **${oldTeamName}** to **${newTeamName}**!`
    );

    console.log(`${user} renamed "**${oldTeamName}**" to "**${newTeamName}**"`);
  },
};
