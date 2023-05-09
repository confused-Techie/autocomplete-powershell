const childProcess = require("child_process");
const { Disposable } = require("atom");
const helpers = require("./helpers.js");
const COMPLETIONS = require("../COMPLETIONS.json");
const moduleProviders = [];

function getCompletions(text) {
  let completions = [];

  if (helpers.shouldProvideCMDLet(text)) {

    completions = COMPLETIONS.cmdlet.map(a => ({...a}));

    // Then lets loop through the possible entries from community modules
    if (Array.isArray(moduleProviders) && moduleProviders.length > 0) {
      for (let i = 0; i < moduleProviders.length; i++) {
        if (Array.isArray(moduleProviders[i].getModule)) {
          completions = completions.concat(moduleProviders[i].getModule);
        } else if (typeof moduleProviders[i].getModule === "object") {
          completions.push(moduleProviders[i].getModule);
        } else if (typeof moduleProviders[i].getModule === "function") {
          let res = moduleProviders[i].getModule();
          if (Array.isArray(res)) {
            completions = completions.concat(res);
          } else if (typeof res === "object") {
            completions.push(res);
          }
        }
      }
    }

  } else if (helpers.shouldProvideParam(text)) {
    let cmdlet = helpers.cmdletInUse(text);

    if (COMPLETIONS.params[cmdlet]) {
      // Since we might need to modify the autocomplete data on each return
      // we can't just assign completions to our COMPLETIONS object, since
      // it's a shallow copy, and changes will be persisted back to
      // our COMPLETIONS. So we will preform a deep copy. This should be monitored
      // to ensure there are no performance issues
      completions = COMPLETIONS.params[cmdlet].map(a => ({...a}));

      // TODO: Seems autocomplete-plus will fail to autocomplete text with `-`
      // in the first position, failing to handle the prefix of the existing text.
      // Such as typing `-P` autocompleting to `-Path` will inject `--Path` not `-Path`
      // So we will check if the last character is a dash, and remove them all
      // from the existing params within completions
      if (text.slice(-1) === "-") {
        for (let i = 0; i < completions.length; i++) {
          completions[i].text = completions[i].text.replace(/^-/, "");
        }
      }
    } else {
      // We have determined we should provide params for autocomplete
      // But we do not know about the CMDLet that's in use.
      // So to fallback, we will at least provide some completions, such as operators
      completions = COMPLETIONS.operators.map(a => ({...a}));

      if (Array.isArray(moduleProviders) && moduleProviders.length > 0) {
        // We have community modules to inject into our unsupported params
        // We have to pass the module, in case they don't support this one
        for (let i = 0; i < moduleProviders.length; i++) {
          let res = moduleProviders[i].getParams(cmdlet);
          if (Array.isArray(res)) {
            completions = res.concat(completions);
          }
        }
      }

      if (text.slice(-1) === "-") {
        for (let i = 0; i < completions.length; i++) {
          completions[i].text = completions[i].text.replace(/^-/, "");
        }
      }
    }
  }

  return completions;
}

module.exports = {
  selector: ".source.powershell",
  filterSuggestions: true,
  load: () => {

    // Detect if powershell is installed, and if not, warn the user
    if (!atom.config.get("autocomplete-powershell.useStaticCompletions")) {
      // If the user is trying to use PowerShell Completions
      childProcess.exec("$PSVersionTable", { shell: "powershell.exe" }, (error, stdout, stderr) => {
        if (error) {
          // An error thrown we will assume means that this PowerShell command
          // is not available, indicating PowerShell isn't on the path
          // Or that the `powershell.exe` shell is not available
          atom.notifications.addError(
            "Autocomplete-PowerShell was unable to access PowerShell on this system",
            {
              description: "Ensure PowerShell is installed, or use Static Completions in settings.",
              dismissable: true
            }
          )
        }
      });
    }

    // Lets also go ahead and add a command to let users find all the providers in use
    atom.commands.add("atom-text-editor", {
      "autocomplete-powershell: Show Module Providers": () => {
        let textToShow = [];
        if (Array.isArray(moduleProviders) && moduleProviders.length > 0) {
          for (let i = 0; i < moduleProviders.length; i++) {

            if (typeof moduleProviders[i].name !== "undefined") {
              textToShow.push(moduleProviders[i].name);
            } else {
              textToShow.push(`${moduleProviders[i].constructor.name}(${moduleProviders[i].id})`);
            }
          }
        } else {
          textToShow.push("No Module Providers added.");
        }

        let text = textToShow.join("\n");
        atom.notifications.addInfo(text, { dismissable: true });
      }
    });
  },
  registerProvider: (provider) => {
    if (provider == null) { return; }

    if (typeof provider.getModule === "undefined") {
      throw new Error(`Autocomplete-PowerShell provider ${provider.constructor.name}(${provider.id}) missing 'getModule()'`);
    }
    if (typeof provider.getParams === "undefined") {
      throw new Error(`Autocomplete-PowerShell provider ${provider.constructor.name}(${provider.id}) missing 'getParams()'`);
    }

    // Add the provider to our local array saving it's index (or new length of array)
    let newModProvLength = moduleProviders.push(provider);

    // When the package is disposed, we can then remove it from our array as well
    let originalDispose = provider.dispose;

    let disposable = new Disposable(() => {
      moduleProviders.splice(newModProvLength-1, 1);
    });

    if (originalDispose) {
      proivder.dispose = () => {
        originalDispose.call(provider);
        disposable.dispose();
      };
    }

    return disposable;
  },
  getSuggestions: ({bufferPosition, editor, scopeDescriptor, prefix}) => {
    // Lets test just always attempting a completion now matter what was typed
    // Buffer Position has row and column attached
    //return getCompletions(fullBuffer, bufferPosition);
    if (atom.config.get("autocomplete-powershell.useStaticCompletions")) {
      let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);

      return getCompletions(line);

    } else {
      //let fullBuffer = editor.getBuffer().getText();
      // Commenting out line since the column doesn't line up on rows below 1
      // https://github.com/PowerShell/PowerShell/blob/master/test/powershell/Host/TabCompletion/TabCompletion.Tests.ps1
      // PowerShell autocompletion tests indicate that I may be able to inject history
      // to allow completions of local variables
      // Although autocomplete-plus should do this as well
      let line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      // We will use the systems PowerShell to provide completions
      return new Promise((resolve, reject) => {
        let completions = [];

        childProcess.exec(
          `TabExpansion2 -inputScript "${line}" -cursorColumn ${bufferPosition.column} | ConvertTo-Json`,
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
