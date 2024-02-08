import { SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import HackathonService from "../utils/HackathonService";

export const promote: Command = {
  data: new SlashCommandBuilder()
    .setName("promote")
    .setDescription(
      "Promote your team to the entire server! This will let anyone join!"
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { user, guild } = interaction;
    if (!guild) return;

    const member = await HackathonService.getMember(guild, user);
    if (!member) return;

    const team = await HackathonService.getTeam(member);

    // Cancel if user is not in a team
    if (!team) {
      await interaction.editReply(HackathonService.notInTeamMessage());
      return;
    }

    // Cancel if team is at max capacity
    if (team.members.size >= 4) {
      await interaction.editReply(HackathonService.teamAtMaxMessage(team));
      return;
    }

    const promotionChannel = HackathonService.promotionChannel(guild);
    const promotion = await promotionChannel.send(
      await HackathonService.promotionMessage(team)
    );

    await promotion.react("✅");

    const collector = promotion.createReactionCollector({ time: 5 * 60000 });

    await interaction.editReply({
      content: `Promoted ${team} in ${promotionChannel}!`,
    });

    collector.on("collect", async (reaction, joiningUser) => {
      const joiningMember = await HackathonService.getMember(
        guild,
        joiningUser
      );
      if (!joiningMember) return;

      const currentTeam = await HackathonService.getTeam(joiningMember);
      if (currentTeam)
        return (await user.createDM()).send(
          HackathonService.alreadyInTeamMessage(currentTeam)
        );

      await HackathonService.addToTeam(joiningMember, team);

      if (team.members.size >= 4) {
        collector.stop();
      }
    });

    collector.on("end", async () => {
      await promotion.delete();
    });
  },
};
