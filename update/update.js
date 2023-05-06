/**
  This file is in charge of creating the COMPLETIONS.json file automatically
  It's intended that this file is able to be created automatically from
  the PowerShell docs for any given version.

  Since the PowerShell Docs seem to be very very well and strictly structured,
  ideally this is a rather simple endevear.

  ---

  The COMPLETIONS.json file:

  The file itself should have three seperate sections:
    - cmdlet: This is an array of objects, ready to be autofilled
      that define every single CMDLet available to PowerShell.
      Where the only special value will be the `rightLabel` which should
      properly define the namespace of the cmdlet.
    - params: This is an object, where each key is the cmdlet that uses the
      parameter. Then each cmdlet has an array of objects ready to be autofilled
      of that parameter. Where the `rightLabel` is the data type as defined by
      the PowerShell docs.
    - operators: This will store only the operators we care about.
      This section may have to be manually created, but we will see.

  ---

  The PowerShell Docs:

  The docs are located at: https://github.com/MicrosoftDocs/PowerShell-Docs/

  Where within `./reference/VERSION/` we can find the docs we care about.
  Using the version we can update the docs per version, and within that version
  key are the docs of each module.

  Within each modules folder there will be an index file, named like so:
  `Microsoft.PowerShell.MODULE.md` this file can be ignored for our purposes.

  But afterwards we care about every file there.
  Where the frontmatter helpfull defines the Module Name, and the link on the web

  Then otherwise each section we care about has a nicely defined header.
*/

const childProcess = require("node:child_process");
const fs = require("fs");
const path = require("path");
const fm = require("front-matter");

const COMMON_PARAMETERS = require("./common_parameters.json");
const OPERATORS = require("./operators.json");
const POWERSHELL_VERSION = "7.3";

async function update() {
  // Our Objects to fill
  let CMDLET = [];
  let PARAMS = {};

  // Check if our repo is already cloned, and if so skip cloning
  if (!fs.existsSync("./powershellDocs")) {
    let cloneRepo = await cloneDocRepo();

    if (!cloneRepo) {
      console.error("An error occured cloning the PowerShell-Docs Repo!");
      process.exit(1);
    }
  }

  // Now that the repo is cloned we can go ahead and start generating our docs
  const fileHandler = async (filePath, pathArray, file) => {

    // When handling each file we don't care about the 'About' files,
    // nor do we care about the index files as described above
    if (pathArray.includes("About")) {
      return; // Ignore about files
    }

    if (file.startsWith("Microsoft.PowerShell")) {
      return; // Ignore index files
    }

    // Specially named index files
    if (["CimCmdlets.md", "PSDiagnostics.md", "PSReadLine.md", "ThreadJob.md"].includes(file)) {
      return;
    }

    // The following actions are largley based off `Microsoft.PowerShell.Management/Add-Content.md`

    const data = fs.readFileSync(`./${filePath}`, "utf8");

    const frontMatter = fm(data);

    let title = frontMatter.attributes.title ?? file.replace(".md", "");

    CMDLET.push({
      displayText: title,
      text: title,
      description: generateSynopsis(frontMatter.body),
      descriptionMoreURL: frontMatter.attributes["online version"],
      rightLabel: frontMatter.attributes["Module Name"]
    });

    const paramData = frontMatter.body.split("## PARAMETERS")[1];

    PARAMS[title] = generateParams(paramData, title);

  };

  await enumerateFiles(`./powershellDocs/reference/${POWERSHELL_VERSION}/`, [], fileHandler);

  // Now here, we would want to handle using our operators but for now lets just save

  const comp = {
    cmdlet: CMDLET,
    params: PARAMS,
    operators: OPERATORS
  };

  fs.writeFileSync("COMPLETIONS.json", JSON.stringify(comp, null, 2));

  console.log("Successfully updated completions!");

}

async function cloneDocRepo() {
  return new Promise((resolve, reject) => {
    try {

      childProcess.exec(
        "git clone https://github.com/MicrosoftDocs/PowerShell-Docs powershellDocs",
        { shell: "cmd.exe" },
        (error, stdout, stderr) => {
          if (error) {
            throw error;
            process.exit(1);
          }

          resolve(true);
        });
    } catch(err) {
      throw err;
      process.exit(1);
    }
  });
}

async function enumerateFiles(dir, pathArray, callback) {

  let files = fs.readdirSync(dir);

  for (const file of files) {
    let target = path.join(dir, file);

    if (fs.lstatSync(target).isDirectory()) {
      await enumerateFiles(`./${target}`, [ ...pathArray, file ], callback);
    } else {
      await callback(target, pathArray, file);
    }
  }
}

function generateSynopsis(text) {
  try {
    let initial = text.match(/(?<=## SYNOPSIS)[\s\S]*?(?=## SYNTAX)/)[0];

    initial = initial.trim();
    initial = initial.replace(/(\r\n|\n|\r)/gm, " ");

    let firstSentenceReg = /[\s\S]*?\.\s*/;

    if (firstSentenceReg.test(initial)) {
      // This would indicate that the text is multiline,
      initial = initial.match(firstSentenceReg)[0];
    }

    // TODO Maybe parse markdown?
    return initial;

  } catch(err) {
    console.log(err);
    return "";
  }
}

function generateParams(text, moduleName) {

  let lineEndingReg = /(\r\n|\n|\r)/gm;
  let firstSentenceReg = /[\s\S]*?\.\s+/;

  if (typeof text !== "string" && text?.length < 1) {
    return [];
  }

  // Text will be the text of the docs page, starting at our parameters
  try {
    text = text.split("## INPUTS")[0];
  } catch(err) {
    return [];
  }
  // ^^ Remove the trailing data we don't care about

  let allParams = text.split("###"); // Split by each param heading

  let arrayParams = [];

  for (let i = 0; i < allParams.length; i++) {
    // Lets first do some safety checks
    let curString = allParams[i];

    if (curString.replace(lineEndingReg, "").length < 1) {
      continue;
    }

    let paramTitle = curString.split(lineEndingReg, 1)[0];
    paramTitle = paramTitle.trim();
    // Keep in mind this still hase `-`

    if (paramTitle === "CommonParameters") {
      // We will have special handling here for the common handlers
      arrayParams = arrayParams.concat(COMMON_PARAMETERS);

      continue;
    }

    let description = curString;

    try {
      description = description.replace(paramTitle, "");
      description = description.trim();
      description = description.replace(lineEndingReg, " ");
      description = description.match(firstSentenceReg)[0];
      description = description.trim();
      //description = curString.split(lineEndingReg, 1)[2].match(firstSentenceReg)[0];
    } catch(err) {
      description = curString;
    }
    //let description = curString.split(lineEndingReg, 1)[2].match(firstSentenceReg)[0];

    let rawType;

    try {
      rawType = curString.match(/Type: (.*)/)[1];
    } catch(err) {
      rawType = "";
    }
    //let rawType = curString.match(/Type: (.*)/)[1];

    arrayParams.push({
      displayText: paramTitle.replace("-", ""),
      text: paramTitle,
      description: description,
      rightLabel: rawType
    });

  }

  return arrayParams;
}

update();
