import { createClient } from "@supabase/supabase-js";
import { User } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export const getWhitelistRecordByEmail = async (email: string) => {
  return await supabase.from("whitelist").select().eq("email", email);
};

export const getWhitelistRecordByUser = async (user: User) => {
  return await supabase.from("whitelist").select().eq("discord_id", user.id);
};

export const checkIfWhitelisted = async (email: string) => {
  const isWhitelistedResponse = await getWhitelistRecordByEmail(email);

  return !!(
    !isWhitelistedResponse.error &&
    isWhitelistedResponse.data &&
    isWhitelistedResponse.data.length > 0
  );
};

export const whitelistUser = async (email: string) => {
  const isWhitelisted = await checkIfWhitelisted(email);
  if (isWhitelisted) return true;

  const whitelistResponse = await supabase.from("whitelist").insert({ email });

  return !whitelistResponse.error;
};

export const blacklistUser = async (email: string) => {
  const isBlacklisted = !(await checkIfWhitelisted(email));
  if (isBlacklisted) return true;

  const blacklistResponse = await supabase
    .from("whitelist")
    .delete()
    .eq("email", email);

  return !blacklistResponse.error;
};

export const checkIfLinkedToOther = async (email: string, user: User) => {
  const isLinkedResponse = await getWhitelistRecordByEmail(email);

  return (
    !isLinkedResponse.error &&
    isLinkedResponse.data &&
    isLinkedResponse.data.length > 0 &&
    !!isLinkedResponse.data[0].discord_id &&
    isLinkedResponse.data[0].discord_id !== user.id
  );
};

export const linkDiscordId = async (email: string, user: User) => {
  const isLinked = await checkIfLinkedToOther(email, user);
  if (isLinked) return false;

  const linkDiscordIdResponse = await supabase
    .from("whitelist")
    .update({ discord_id: user.id })
    .eq("email", email)
    .select();

  return !!(
    !linkDiscordIdResponse.error &&
    linkDiscordIdResponse.data &&
    linkDiscordIdResponse.data.length > 0
  );
};
