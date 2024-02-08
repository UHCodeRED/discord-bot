import { SlashCommandBuilder, TextChannel } from "discord.js";
import { Command } from "../interfaces/Command";
import HackathonService from "../utils/HackathonService";
import { createGeneral } from "../utils/embedCreator";

export const autoteamrole: Command = {
  data: new SlashCommandBuilder()
    .setName("autoteamrole")
    .setDescription("Send the auto team role message!")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel to send the message in!")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const { guild } = interaction;
    if (!guild) return;

    const channel = interaction.options.getChannel(
      "channel",
      true
    ) as TextChannel;
    await channel.bulkDelete(100);

    const teamless = await HackathonService.getTeamless(guild);
    if (!teamless) return;
    const embed = createGeneral(
      "👥 Sign Up for AutoTeam!",
      `${teamless} If you want to be part of a team but don't know anyone to team with, sign up for AutoTeam! After a while once enough people have joined, AutoTeam will randomly select 4 people and create a new team for them! Keep in mind that this is totally voluntary, so it's completely up to you!\n\nReact below to sign up!`
    ).setColor("Yellow");

    const message = await channel.send({ embeds: [embed] });
    await message.react("👥");

    const collector = message.createReactionCollector({ dispose: true });

    await interaction.editReply({
      content: `Message sent in ${channel}!`,
    });

    collector.on("collect", async (reaction, joinUser) => {
      const joinMember = await HackathonService.getMember(guild, joinUser);
      if (!joinMember) return;

      if (await HackathonService.getTeam(joinMember)) {
        await reaction.users.remove(joinUser);
        return;
      }

      const role = guild.roles.cache.find(
        (role) => role.name.toLowerCase() === "autoteam"
      );
      if (!role) return;

      await joinMember.roles.add(role);
      console.log(`${joinUser} signed up for AutoTeam!`);
    });

    collector.on("remove", async (reaction, joinUser) => {
      const joinMember = await HackathonService.getMember(guild, joinUser);
      if (!joinMember) return;

      const role = guild.roles.cache.find(
        (role) => role.name.toLowerCase() === "autoteam"
      );
      if (!role) return;

      await joinMember.roles.remove(role);

      if (await HackathonService.getTeam(joinMember)) {
        return;
      }
      console.log(`${joinUser} opted out of AutoTeam!`);
    });
  },
};
