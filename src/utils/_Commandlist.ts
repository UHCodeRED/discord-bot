import { accept } from "../commands/accept";
import { autoteam } from "../commands/autoteam";
import { autoteamrole } from "../commands/autoteamrole";
import { create_team } from "../commands/create_team";
import { help } from "../commands/help";
import { invite } from "../commands/invite";
import { leave_team } from "../commands/leave_team";
import { promote } from "../commands/promote";
import { reject } from "../commands/reject";
import { rename_team } from "../commands/rename_team";
import { report } from "../commands/report";
import { send } from "../commands/send";
import { verify } from "../commands/verify";
import { whois } from "../commands/whois";
import { Command } from "../interfaces/Command";

export const CommandList: Command[] = [
  send,
  create_team,
  invite,
  leave_team,
  autoteam,
  autoteamrole,
  promote,
  accept,
  reject,
  verify,
  whois,
  report,
  rename_team,
  help,
];
