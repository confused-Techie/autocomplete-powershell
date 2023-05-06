
function shouldProvideCMDLet(text) {
  // Determines if the next text following is likely to be a CMDLet

  if (text.length < 1) {
    // If the text is a fresh new line, we likely will need a CMDLet
    return true;
  } else if (text.match(/^\s*$/)) {
    // If there is only whitespace text such as tabs or spaces, then we will likely
    // want a CMDLet
    return true;
  } else if (text.match(/^\s*#/)) {
    // This line is a comment,
    return false;
  } else if (text.match(/\s*[a-zA-Z]+$/)) {
    // This now accepts the below specs at the end of the line. Accepting anything
    // at the beginning.
    // If there is only whitepspace then some unbroken text, then we likely need
    // a CMDLet
    return true;
  } else {
    return false;
  }
  // TODO: Check for things such as comments, or otherwise only non CMDlet values like vars
}

function shouldProvideParam(text) {
  // Determines if the next text following is likely to be a CMDLet Parameter
  // Since Params are only provided after successfully matching an existing CMDLet
  // this check really only prevents unecessary computation
  if (text.length < 1) {
    return false;
  } else if (text.match(/^\s*$/)) {
    return false;
  } else if (text.match(/^\s*#/)) {
    // If this line is a comment
    return false;
  } else {
    return true;
  }
}

function cmdletInUse(text) {
  // Determines what the CMDLet we are currently working with's name.
  //let reg = /\s*([a-zA-Z0-9-]+)\s+(-|$)/;
  let reg = /\s*((?<! -)[a-zA-Z0-9]+-{0,1}[a-zA-Z0-9]+)\s*((-[a-zA-Z0-9]+\s*[^|;]*)+|-|$)$/;

  let match = text.match(reg);

  if (Array.isArray(match) && match.length > 2 && typeof match[1] === "string" && match[1].length > 0) {
    return match[1];
  } else {
    return "";
  }
}

module.exports = {
  shouldProvideCMDLet,
  shouldProvideParam,
  cmdletInUse,
};
