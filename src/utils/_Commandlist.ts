import { autoteam } from "../commands/autoteam";
import { autoteamrole } from "../commands/autoteamrole";
import { create_team } from "../commands/create_team";
import { invite } from "../commands/invite";
import { leave_team } from "../commands/leave_team";
import { promote } from "../commands/promote";
import { send } from "../commands/send";
import { Command } from "../interfaces/Command";

export const CommandList: Command[] = [
  send,
  create_team,
  invite,
  leave_team,
  autoteam,
  autoteamrole,
  promote,
];
