/**
 * Builds commands and options for a Commander.js program object using an array of command objects.
 *
 * @param {Object[]} commands - An array of command objects, where each object represents a command with its options.
 * @param {string} commands.name - The name of the command.
 * @param {string} commands.description - The description of the command.
 * @param {Object[]} commands.options - An array of option objects for the command.
 * @param {string} commands.options.flags - The flags for the option.
 * @param {string} commands.options.description - The description of the option.
 * @param {function} commands.action - The action function for the command.
 */
const build_cli = (program, commands) => {
	// Loop through the commands and add them to the program.
	for (const command of commands) {
		let cmd = program
			.command(command.name)
			.description(command.description || "No description provided.");

		// Add all command options.
		if (command.options)
			for (const option of command.options)
				cmd = cmd.option(
					option.flags,
					option.description || "No description provided."
				);

		// Add all command arguments.
		if (command.arguments)
			for (const argument of command.arguments)
				cmd = cmd.argument(
					argument.flags,
					argument.description || "No description provided."
				);

		cmd.action(command.action);
	}
};

module.exports = build_cli;
