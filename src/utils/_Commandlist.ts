import { create_team } from "../commands/createteam";
import { send } from "../commands/send";
import { Command } from "../interfaces/Command";
export const CommandList: Command[] = [send, create_team];
