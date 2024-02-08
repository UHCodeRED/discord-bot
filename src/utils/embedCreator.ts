import { EmbedBuilder } from "discord.js";

export const createGeneral = (
  title: string,
  description: string,
  fields?: {
    name: string;
    value: string;
  }[]
) => {
  const embed = new EmbedBuilder()
    .setColor("#ffeded")
    .setTitle(title)
    .setDescription(description)
    .setTimestamp(null)
    .setFooter(null)
    .setColor(0xff0000);

  if (fields && fields.length !== 0) {
    fields.map((data) => {
      embed.addFields([
        {
          name: data.name,
          value: data.value,
        },
      ]);
    });
  }

  return embed;
};
