import { WebClient } from "@slack/web-api";
import { Member } from "@slack/web-api/dist/types/response/UsersListResponse.js";
import { Speaker } from "./speaker.js";
import { extractSpeakerOrUndefined } from "./member.functions.js";


function isValidMember(m: Member): boolean {
  return !m.is_bot && !m.deleted && m.id !== "USLACKBOT";
}

async function collectMembersAsync(): Promise<Member[]> {
  const client = new WebClient(process.env.SLACK_TOKEN);
  const result = await client.users.list({});

  return result.members ?? [];
}

export async function getAllSpeakers(): Promise<Speaker[]> {
  const members = await collectMembersAsync();

  return mapToValidSpeakers(members);
}
function mapToValidSpeakers(members: Member[]): Speaker[] {
  return members
    .filter((m) => isValidMember(m))
    .map((m) => extractSpeakerOrUndefined(m))
    .filter((s): s is Speaker => !!s);
}

