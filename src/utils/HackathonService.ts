import {
  CategoryChannel,
  ChannelType,
  Collection,
  ColorResolvable,
  Guild,
  GuildMember,
  InteractionReplyOptions,
  MessagePayload,
  Role,
  TextChannel,
  User,
} from "discord.js";

export default class HackathonService {
  static mainRoles = [
    "Officer",
    "Guest",
    "Admin",
    "Hacker",
    "Teamless",
    "AutoTeam",
    "Server Booster",
    "Server Manager",
    "@everyone",
    "everyone",
    "here",
  ];

  static getColor = (color: string | null): ColorResolvable => {
    let r = Math.random() * 256;
    let g = Math.random() * 256;
    let b = Math.random() * 256;
    if (color) {
      if (color.length === 6) {
        r = parseInt(color.substring(0, 2), 16);
        g = parseInt(color.substring(2, 4), 16);
        b = parseInt(color.substring(4, 6), 16);
      }
    }
    return [r, g, b];
  };

  static getTeam = async (member: GuildMember): Promise<Role | undefined> => {
    const memberRoles = await this.getMemberRoles(member);
    return memberRoles.find(
      (memberRole) =>
        !this.mainRoles.find(
          (mainRole) => mainRole.toLowerCase() === memberRole.name.toLowerCase()
        )
    );
  };

  static getMemberRoles = async (
    member: GuildMember
  ): Promise<Collection<string, Role>> => {
    return member.roles.cache;
  };

  static getMember = async (
    guild: Guild,
    user: User
  ): Promise<GuildMember | undefined> => {
    const members = await guild.members.fetch();
    if (!members)
      console.log(`Error in "getMember": No members fetched from guild.`);

    const member = members?.find((m) => m.id === user.id);
    if (!member) console.log(`Error in "getMember": User not found in guild.`);

    return member;
  };

  static getGuildRoles = async (
    guild: Guild
  ): Promise<Collection<string, Role> | undefined> => {
    return await guild.roles.fetch();
  };

  static alreadyInTeamMessage = (team: Role): { content: string } => {
    return {
      content: `Sorry, you can only be in 1 team at a time! You're currently in: ${team}.`,
    };
  };

  static badTeamNameMessage = (
    teamName: string
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `Sorry, the team name **${teamName}** is not allowed. Please pick another name!`,
    };
  };

  static addToTeam = async (member: GuildMember, team: Role): Promise<void> => {
    const guild = team.guild;
    await member.roles.add(team);

    const teamless = await this.getTeamless(guild);
    if (teamless) {
      await member.roles.remove(teamless);
    }

    const teamChannel =
      (await this.getTeamChannel(team)) || (await this.createTeamChannel(team));
    if (!teamChannel) return;

    await teamChannel.send(`${member} has joined ${team}!`);
  };

  static createTeamChannel = async (
    team: Role
  ): Promise<TextChannel | undefined> => {
    const { guild } = team;
    const channels = await guild.channels.fetch();

    for (let i = 0; i < 3; i++) {
      const categoryName = `Team Chats ${i + 1}`;
      let category = channels.find(
        (c) =>
          c && c.name === categoryName && c.type === ChannelType.GuildCategory
      ) as CategoryChannel | undefined;

      const everyoneRoleId = guild.roles.cache.find(
        (r) => r.name === "@everyone"
      )?.id;

      if (!category) {
        const newCategory = await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: everyoneRoleId || "0",
              deny: ["ViewChannel"],
            },
          ],
        });

        category = newCategory;
      }

      if (category.children.cache.size === 50) {
        continue;
      }

      const teamChannel = await category.children.create({
        name: team.name,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: everyoneRoleId || "0",
            deny: ["ViewChannel"],
          },
          {
            id: team.id,
            allow: ["ViewChannel", "ReadMessageHistory"],
          },
        ],
      });

      return teamChannel;
    }

    return;
  };

  static getTeamless = async (guild: Guild): Promise<Role | undefined> => {
    return (await guild?.roles.fetch())?.find(
      (r) => r.name.toLowerCase() === "teamless"
    );
  };

  static getTeamChannel = async (
    team: Role
  ): Promise<TextChannel | undefined> => {
    const guild = team.guild;
    const channels = await guild.channels.fetch();

    const teamChannel = channels.find(
      (channel) =>
        channel &&
        channel.permissionsFor(team).has(["ViewChannel"]) &&
        channel.parent?.name.includes("Team Chats")
    );
    if (!teamChannel) {
      return this.createTeamChannel(team);
    }

    return teamChannel as TextChannel;
  };

  static teamNameAllowed = async (teamName: string): Promise<boolean> => {
    return !this.mainRoles.find(
      (mainRole) => mainRole.toLowerCase() === teamName.toLowerCase()
    );
  };

  static teamNameTaken = async (
    teamName: string,
    teams: Collection<string, Role>
  ): Promise<boolean> => {
    return !!teams.find(
      (team) => team.name.toLowerCase() === teamName.toLowerCase()
    );
  };

  static takenTeamNameMessage = (
    teamName: string
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `Sorry, the team name **${teamName}** is already taken. Please pick another name!`,
    };
  };

  static newTeamMessage = async (
    team: Role
  ): Promise<string | MessagePayload | InteractionReplyOptions> => {
    const teamChannel = (await this.getTeamChannel(team)) || `#${team.name}`;
    return {
      content: `Congratulations! You have successfully created your new team, ${team}! Chat with your team in ${teamChannel}!`,
    };
  };

  static botInviteMessage = ():
    | string
    | MessagePayload
    | InteractionReplyOptions => {
    return {
      content: `You cannot have a bot on your team. 🤖`,
    };
  };

  static noTeamToInviteToMessage = ():
    | string
    | MessagePayload
    | InteractionReplyOptions => {
    return {
      content: `You must be in a team to invite somebody! Use the \`/create_team\` command to start a new one!`,
    };
  };

  static teamAtMaxMessage = (
    team: Role
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `Your team ${team} has already hit the maximum of 4 people.`,
    };
  };

  static otherAlreadyInTeamMessage = (
    member: GuildMember,
    team: Role
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `Sorry, ${member} is already in team ${team}.`,
    };
  };

  static inviteFromDifferentTeamMessage = (
    team: Role
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `You cannot send an invite for ${team}.`,
    };
  };

  static inviteMessage = (user: User, team: Role, sender: User): string => {
    return `Hello ${user}! You have been invited to join the team **${team.name}** from ${sender}! Please react with ✅ in the next minute to accept!`;
  };

  static inviteSentMessage = (
    user: User,
    team: Role
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `Invite for ${user} to join ${team} sent!`,
    };
  };

  static joinedTeamMessage = async (team: Role): Promise<string> => {
    const teamName = team.name;
    const teamChannel = await this.getTeamChannel(team);
    return `Congratulations! You have successfully joined **${teamName}**! Chat with your team in ${teamChannel}!`;
  };

  static sentInviteExpiredMessage = (
    invitedMember: GuildMember
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `Invite to ${invitedMember} has expired.`,
      ephemeral: true,
    };
  };

  static notInTeamMessage = ():
    | string
    | MessagePayload
    | InteractionReplyOptions => {
    return {
      content: `You are not currently in a team.`,
    };
  };

  static leaveTeam = async (member: GuildMember): Promise<string> => {
    const guild = member.guild;

    const team = await this.getTeam(member);
    if (!team) return "nothing";

    await member.roles.remove(team);
    console.log(`${member} has left ${team} (**${team.name}**).`);

    const teamless = await this.getTeamless(guild);
    if (teamless) {
      await member.roles.add(teamless);
    }

    const teamChannel =
      (await this.getTeamChannel(team)) || (await this.createTeamChannel(team));
    if (!teamChannel) return team.name;

    if (team.members.size === 0) {
      await teamChannel.delete();
      await team.delete();
      console.log(`**${team.name}** has been abandoned.`);

      return team.name;
    }

    await teamChannel.send(`${member} has left ${team}`);
    return team.name;
  };

  static leaveTeamMessage = (
    teamName: string
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `You have left the team **${teamName}**.`,
    };
  };

  static addManyToTeam = async (
    members: GuildMember[],
    team: Role
  ): Promise<void> => {
    const { guild } = team;
    const teamless = await this.getTeamless(guild);

    const teamChannel = await this.getTeamChannel(team);
    if (!teamChannel) return;

    for (const member of members) {
      await member.roles.add(team);
      teamless && (await member.roles.remove(teamless));
      await teamChannel.send(`${member} has joined ${team}!`);
    }
  };

  static promotionChannel = (guild: Guild): TextChannel => {
    return guild.channels.cache.find(
      (c) => c.id === "1202385184809418753"
    ) as TextChannel;
  };

  static promotionMessage = async (team: Role): Promise<string> => {
    const teamless = (await this.getTeamless(team.guild)) || "Teamless people!";
    return `${teamless} React with ✅ to join ${team}!`;
  };

  static verifiedMessage = ():
    | string
    | MessagePayload
    | InteractionReplyOptions => {
    return {
      content: `✅ You have been verified!`,
    };
  };

  static notVerifiedMessage = (
    email: string
  ): string | MessagePayload | InteractionReplyOptions => {
    return {
      content: `❌ We could not verify you with the email **${email}**.`,
    };
  };

  static getTeams = async (
    guild: Guild
  ): Promise<Collection<string, Role> | undefined> => {
    return (await guild.roles.fetch()).filter((team) =>
      this.teamNameAllowed(team.name)
    );
  };
}
