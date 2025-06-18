#!/usr/bin/env node

import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import shell from "shelljs";
import fs from "fs";
import { Command } from "commander";
import path from "path";
import { fileURLToPath } from "url";

const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .name("dev-starter")
  .description("CLI tool to scaffold frontend apps")
  .version("1.0.0");

program
  .command("create <projectName>")
  .description("Create a new frontend project boilerplate")
  .action(async (projectName) => {
    console.log(
      chalk.blue.bold(`\nLet's create a new project called: ${projectName}\n`)
    );

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "framework",
        message: "Which framework would you like to use?",
        choices: ["React", "Vue", "Svelte"],
      },
      {
        type: "confirm",
        name: "tailwind",
        message: "Would you like to install and configure Tailwind CSS?",
        default: true,
      },
    ]);

    const framework = answers.framework.toLowerCase();
    const useTailwind = answers.tailwind;
    const template = `${framework}-ts`;

    const spinner = ora(
      chalk.yellow(`Creating project with Vite (template: ${template})...`)
    ).start();
    const viteCommand = `npm create vite@latest ${projectName} -- --template ${template}`;

    if (shell.exec(viteCommand, { silent: true }).code !== 0) {
      spinner.fail(chalk.red("Failed to create project with Vite."));
      shell.exit(1);
    }
    spinner.succeed(chalk.green("Project created successfully with Vite!"));

    if (useTailwind) {
      shell.cd(projectName); // go inside the new project folder

      const tailwindSpinner = ora(
        chalk.yellow("Installing Tailwind CSS...")
      ).start();

      if (
        shell.exec("npm install -D tailwindcss@3 postcss autoprefixer").code !== 0
      ) {
        tailwindSpinner.fail(
          chalk.red("Failed to install Tailwind dependencies.")
        );
        shell.exit(1);
      }

      if (shell.exec("npx tailwindcss init -p", { silent: true }).code !== 0) {
        tailwindSpinner.fail(chalk.red("Failed to initialize Tailwind CSS."));
        shell.exit(1);
      }

      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
      fs.writeFileSync("tailwind.config.js", tailwindConfig);

      const cssPath = "src/index.css";
      const tailwindDirectives =
        "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";
      fs.writeFileSync(cssPath, tailwindDirectives);

      tailwindSpinner.succeed(
        chalk.green("Tailwind CSS installed and configured!")
      );
    }

    const installSpinner = ora(
      chalk.yellow("Installing project dependencies (npm install)...")
    ).start();
    if (shell.exec("npm install", { silent: true }).code !== 0) {
      installSpinner.fail(chalk.red("Failed to install project dependencies."));
      shell.exit(1);
    }
    installSpinner.succeed(chalk.green("Dependencies installed!"));

    console.log(chalk.green.bold("\n🚀 Your project is ready!"));
    console.log("\nTo get started, run:\n");
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan("  npm run dev\n"));

    console.log("PWD:", shell.pwd().stdout);
    console.log("Tailwind binary exists:", shell.test('-f', './node_modules/.bin/tailwindcss'));
  });

program.parse(process.argv);
