const fs = require("fs");
const path = require("path");
const { prompt } = require("enquirer");

async function runScript() {
  const answers = await prompt([
    {
      type: "input",
      name: "version",
      message: "Enter the version number:",
      validate: (input) =>
        input.trim() !== "" ? true : "Version number is required",
    },
    {
      type: "input",
      name: "messages",
      message:
        "Enter your changelog messages (one per line, press ENTER twice to finish):\n",
      multiline: true,
      validate: (input) =>
        input.trim() !== "" ? true : "At least one message is required",
    },
  ]);

  const newVersion = answers.version;
  const messages = answers.messages.trim().split("\n");

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
  console.log("Messages added to CHANGELOG.md:");
  messages.forEach((message, index) => {
    console.log(`${index + 1}. ${message}`);
  });
}

runScript();
