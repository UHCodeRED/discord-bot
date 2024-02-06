import { SlashCommandBuilder } from "discord.js";
import { Command } from "../interfaces/Command";
import HackathonService from "../utils/HackathonService";

export const invite: Command = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite someone to your hackathon team!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The person you want to invite!")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const { user, guild } = interaction;
    if (!guild) return;

    const invitedUser = interaction.options.getUser("user", true);

    if (invitedUser.bot) {
      await interaction.editReply(HackathonService.botInviteMessage());
      return;
    }

    const invitedMember = await HackathonService.getMember(guild, invitedUser);
    if (!invitedMember) return;
    const sendingMember = await HackathonService.getMember(guild, user);
    if (!sendingMember) return;

    const team = await HackathonService.getTeam(sendingMember);

    if (!team) {
      await interaction.editReply(HackathonService.noTeamToInviteToMessage());
      return;
    }

    if (team.members.size >= 4) {
      await interaction.editReply(HackathonService.teamAtMaxMessage(team));
      return;
    }

    const invitedMemberTeam = await HackathonService.getTeam(invitedMember);
    if (invitedMemberTeam) {
      await interaction.editReply(
        HackathonService.otherAlreadyInTeamMessage(
          invitedMember,
          invitedMemberTeam
        )
      );
      return;
    }

    const goodTeamName = await HackathonService.teamNameAllowed(team.name);
    if (!goodTeamName) {
      await interaction.editReply(
        HackathonService.inviteFromDifferentTeamMessage(team)
      );
      return;
    }

    const invitedMemberDM = await invitedMember.createDM();
    const invite = await invitedMemberDM.send(
      HackathonService.inviteMessage(invitedUser, team, user)
    );
    await invite.react("✅");

    console.log(
      `${user} has invited ${invitedUser} to ${team} (**${team.name}**).`
    );

    const inviteAcceptCollector = invite.createReactionCollector({
      time: 60000,
    });

    await interaction.editReply(
      HackathonService.inviteSentMessage(invitedUser, team)
    );

    inviteAcceptCollector.on("collect", async (reaction, acceptedUser) => {
      if (acceptedUser.id !== invitedUser.id) return;

      console.log(
        `${invitedUser} has accepted ${user}'s invitation to ${team} (**${team.name}**).`
      );

      await HackathonService.addToTeam(invitedMember, team);
      await invitedMemberDM.send(
        await HackathonService.joinedTeamMessage(team)
      );

      inviteAcceptCollector.stop();
    });

    inviteAcceptCollector.on("end", async () => {
      if ((await HackathonService.getTeam(invitedMember)) === team) return;

      console.log(
        `${user}'s invitation to ${invitedUser} for ${team} (**${team.name}**) has expired.`
      );

      await invitedMemberDM.send(`Sorry, this invite has expired!`);
      await interaction.followUp(
        HackathonService.sentInviteExpiredMessage(invitedMember)
      );
    });
  },
};
