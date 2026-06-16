import { Member } from "@slack/web-api/dist/types/response/UsersListResponse.js";
import { Speaker } from "./speaker.js";
import { toPascalCase } from "../../string.functions.js";

type MemberWithRealnameHolder = {
  real_name: string;
  profile: {
    email: string;
  };
};

type MemberWithNameHolder = {
  name: string;
  profile: {
    email: string;
  };
};


function extractByName(m: MemberWithNameHolder): Speaker | null {
  return applyPascalCaseInSpeaker({
    firstname: m.name.split(".")[0],
    lastname: m.name.split(".")[1],
    company: m.profile.email.split("@")[1].split(".")[0].replace(/-/g, " "),
  });
}
function hasValidRealname(m: Member): m is MemberWithRealnameHolder {
  return !!m.real_name 
    && m.real_name.split(" ").length === 2;
}


function hasValidName(m: Member): m is MemberWithNameHolder {
  return !!m.name 
    && m.name.split(".").length === 2 
    && !/\d/.test(m.name);
}

function extractByRealName(m: MemberWithRealnameHolder): Speaker | null {
  return applyPascalCaseInSpeaker({
    firstname: m.real_name.split(" ")[0],
    lastname: m.real_name.split(" ")[1],
    company: m.profile.email.split("@")[1].split(".")[0].replace(/-/g, " "),
  });
}

function applyPascalCaseInSpeaker(s: Speaker): Speaker {
  return {
    firstname: toPascalCase(s.firstname),
    lastname: toPascalCase(s.lastname),
    company: toPascalCase(s.company),
  };
}

export function extractSpeakerOrUndefined(m: Member): Speaker | null {
  return hasValidName(m)
    ? extractByName(m)
    : hasValidRealname(m)
      ? extractByRealName(m)
      : null;

  
}
