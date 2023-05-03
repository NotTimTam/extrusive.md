#!/usr/bin/env node

const { program } = require("commander");
const build_cli = require("./resources/scripts/build_cli");
const build_project = require("./resources/scripts/build_project");
const build_app = require("./resources/scripts/build_app");
const start_project = require("./resources/scripts/start_project");

// Build the cli commands.
build_cli(program, [
	{
		name: "create",
		description: "Create an extrusive app.",
		arguments: [
			{
				flags: "<project-directory>",
				description: "The directory to create the app in.",
			},
		],
		options: [
			{
				flags: "--force",
				description:
					"Force the directory to be created, even if it overrides existing files. (WARNING: This is destructive!)",
			},
		],
		action: build_project,
	},
	{
		name: "build",
		description: "Build and compile your extrusive app.",
		options: [
			{
				flags: "--output-directory <output-directory>",
				description:
					'Pick an output location. Otherwise defaults to a "build" folder within the current directory.',
			},
			{
				flags: "--force",
				description:
					"Force the directory to be created, even if it overrides existing files. (WARNING: This is destructive!)",
			},
		],
		action: build_app,
	},
	{
		name: "start",
		description: "Run your app in developer mode.",
		action: start_project,
	},
]);

// options: [
// 	{
// 		flags: "--project-directory <project-directory>",
// 		description: "The directory to create the app in.",
// 	},
// 	// { flags: "-a, --age <age>", description: "Your age" },
// ],

program.parse(process.argv);
