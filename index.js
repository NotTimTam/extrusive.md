#!/usr/bin/env node

const { program } = require("commander");
const build_cli = require("./resources/scripts/build_cli");
const build_project = require("./resources/scripts/build_project");

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
					"Force the directory to be created, even if it overrides files. (WARNING: This is destructive!)",
			},
		],
		action: build_project,
	},
	{
		name: "build",
		description: "Build and compile your extrusive app.",
		options: [
			{
				flags: "--dev",
				description: "Build in developer mode.",
			},
		],
		action: ({ dev }) => {
			console.log(
				`Building in ${dev ? "developer" : "production"} mode.`
			);
		},
	},
	{
		name: "start",
		description: "Run your app in developer mode.",
		action: () => {
			console.log("Start!");
		},
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
