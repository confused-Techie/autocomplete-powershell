const childProcess = require("child_process");

function getCompletions(text) {
  let completions = [];

  return completions;
}

module.exports = {
  selector: ".source.powershell",
  filterSuggestions: true,
  load: () => {

    // Detect if powershell is installed, and if not, warn the user
    if (!atom.config.get("autocomplete-powershell.useStaticCompletions")) {
      // If the user is trying to use PowerShell Completions
      childProcess.exec("$PSVersionTable", { shell: "powershellF.exe" }, (error, stdout, stderr) => {
        if (error) {
          if (error instanceof ENOENT) {
            console.error("No Powershell!");
          } else {
            console.error(error);
          }
        }
      });
    }
  },
  getSuggestions: ({bufferPosition, editor, scopeDescriptor, prefix}) => {
    // Lets test just always attempting a completion now matter what was typed
    // Buffer Position has row and column attached
    //return getCompletions(fullBuffer, bufferPosition);
    if (atom.config.get("autocomplete-powershell.useStaticCompletions")) {
      let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);

      return getCompletions(line);

    } else {
      let fullBuffer = editor.getBuffer().getText();
      // We will use the systems PowerShell to provide completions
      return new Promise((resolve, reject) => {
        let completions = [];

        childProcess.exec(
          `TabExpansion2 -inputScript "${fullBuffer}" -cursorColumn ${bufferPosition.column} | ConvertTo-Json`,
          {
            shell: "powershell.exe",
            cwd: editor.getPath().replace(/[\\\/]\w+\.\w+$/, "")
            // ^^ Lazely set the current directory to allow PowerShell access to the
            // local files during completions
          },
          (error, stdout, stderr) => {
            if (error) {
              console.error(error);
              resolve(completions);
            }
            let value = JSON.parse(stdout);

            for (let i = 0; i < value.CompletionMatches.length; i++) {
              completions.push({
                text: value.CompletionMatches[i].CompletionText,
                displaytext: value.CompletionMatches[i].ListItemText,
                snippet: null,
                replacementPrefix: prefix
              });
            }

            resolve(completions);
          }
        );

      });
    }
  },
};
