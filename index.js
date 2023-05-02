#!/usr/bin/env node

const { program } = require("commander");
const build_cli = require("./resources/scripts/build_cli");

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
		// options: [
		// 	{
		// 		flags: "--project-directory <project-directory>",
		// 		description: "The directory to create the app in.",
		// 	},
		// 	// { flags: "-a, --age <age>", description: "Your age" },
		// ],
		action: (directory) => {
			console.log(directory);
		},
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
]);

program.parse(process.argv);
