import { create_team } from "../commands/create_team";
import { invite } from "../commands/invite";
import { send } from "../commands/send";
import { Command } from "../interfaces/Command";
export const CommandList: Command[] = [send, create_team, invite];
