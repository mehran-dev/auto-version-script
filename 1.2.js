const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

// Parse command line arguments
const argv = yargs
  .option("v", {
    describe: "Specify the version number",
    demandOption: true,
    type: "string",
  })
  .option("messages", {
    describe: "Specify an array of messages",
    demandOption: true,
    type: "array",
  })
  .help().argv;

// Extract version and messages from arguments
const newVersion = argv.v;
const messages = argv.messages;

// Update the version in package.json
const packageJsonPath = path.join(__dirname, "package.json");
const packageJson = require(packageJsonPath);
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
// Update the version in .env file
const envFilePath = path.join(__dirname, ".env");
let envFileContent = fs.readFileSync(envFilePath, "utf-8");
envFileContent = envFileContent.replace(
  /NEX_VERSION_APP=.*/,
  `NEX_VERSION_APP=${newVersion}`
);
fs.writeFileSync(envFilePath, envFileContent);

// Update the CHANGELOG.md
const changelogPath = path.join(__dirname, "CHANGELOG.md");
const today = new Date().toISOString().split("T")[0];
let changelogEntry = `## ${newVersion} (${today})\n`;
messages.forEach((message, index) => {
  changelogEntry += `- ${message}\n`;
});
changelogEntry += `\n${fs.readFileSync(changelogPath, "utf-8")}`;
fs.writeFileSync(changelogPath, changelogEntry);

// Log the version and messages
console.log(`Updated package version to ${newVersion}`);
console.log("Messages:");
messages.forEach((message, index) => {
  console.log(`${index + 1}. ${message}`);
});
