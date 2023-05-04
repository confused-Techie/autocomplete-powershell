const childProcess = require("node:child_process");

childProcess.exec("TabExpansion2 -inputScript 'using ' -cursorColumn 'using '.Length | ConvertTo-Json", {shell: "powershell.exe" },
(error, stdout, stderr) => {
  if (error) {
    console.log("ERROR");
    console.error(error);
  }

  let val = JSON.parse(stdout);
  console.log(typeof val);
  console.log(val);

});
