import * as fs from 'fs'

import { UnifiedPath } from '@oaklean/profiler-core'

import { Profiler } from '../src/index'
import { buildModel } from '../../profiler-core/lib/vscode-js-profile-core/src/cpu/model'

const CURRENT_DIR = new UnifiedPath(__dirname)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = global

const fibonacci = (n: number): number => {
	if (n === 0) {
		return 0
	}
	if (n === 1) {
		return 1
	}
	return fibonacci(n - 1) + fibonacci(n - 2)
}

describe('testing index file', () => {
	test('profile should be created', async () => {
		const profile = new Profiler('test-profile', {
			transformerAdapter: 'ts-jest',
			jestAdapter: {
				config: globalAny.jestConfig,
				context: globalAny.jestContext
			}
		})
		await profile.start('latest')
		fibonacci(20)
		await profile.finish('latest')
		const expectedPath = CURRENT_DIR.join('..', '..', '..', 'profiles', 'test-profile', 'latest.oak')
		expect(fs.existsSync(expectedPath.toPlatformString())).toBeTruthy()

		const expectedCPUProfilePath = CURRENT_DIR.join('..', '..', '..', 'profiles', 'test-profile', 'latest.cpuprofile')
		expect(fs.existsSync(expectedCPUProfilePath.toPlatformString())).toBeTruthy()

		const cpuProfile = JSON.parse(fs.readFileSync(expectedCPUProfilePath.toPlatformString()).toString())

		const t = () => {
			buildModel(cpuProfile)
		}
		expect(t).not.toThrow()
		fs.rmSync(CURRENT_DIR.join('..', '..', '..', 'profiles', 'test-profile').toPlatformString(), { recursive: true })
	}, 20000)
})