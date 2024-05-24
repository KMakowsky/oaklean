import { UnifiedPath, ProjectReport } from '@oaklean/profiler-core'
import { program } from 'commander'

export default class BackendCommands {
	constructor() {
		const parseCommand = program
			.command('backend')
			.description('commands to interact with the backend')

		parseCommand
			.command('send')
			.description('Sends a given .oak report to a backend specified in the .oaklean config')
			.argument('<input>', 'input file path')
			.action(this.sendReportToBackend.bind(this))
	}

	static init() {
		return new BackendCommands()
	}

	async sendReportToBackend(input: string) {
		let inputPath = new UnifiedPath(input)
		if (inputPath.isRelative()) {
			inputPath = new UnifiedPath(process.cwd()).join(inputPath)
		}
		const projectReport = ProjectReport.loadFromFile(inputPath, 'bin')
		if (projectReport === undefined) {
			console.error(`Could not find a profiler report at ${inputPath.toPlatformString()}`)
			return
		}
		await projectReport.uploadToRegistry()
	}
}