import { UnifiedPath } from '@oaklean/profiler-core'

import { VERSION } from './app'

const BINARY_DISTRIBUTION_PACKAGES = {
	'win32': 'OakleanWindowsSensorInterface_x64'
}

export type SupportedPlatforms = keyof typeof BINARY_DISTRIBUTION_PACKAGES

export function getPlatformSpecificBinaryDirectoryPath(platform: SupportedPlatforms) {
	return new UnifiedPath(__dirname).join('..', '..', 'bin', platform, VERSION)
}

export function getPlatformSpecificBinaryPath(platform: SupportedPlatforms) {
	const dirPath = getPlatformSpecificBinaryDirectoryPath(platform)
	return dirPath.join('OakleanWindowsSensorInterface.exe')
}

export function getPlatformSpecificPackageName(platform: SupportedPlatforms) {
	return BINARY_DISTRIBUTION_PACKAGES[`${platform}`]
}

export function getPlatformSpecificDownloadLink(platform: SupportedPlatforms) {
	const platformSpecificPackageName = getPlatformSpecificPackageName(platform)

	// eslint-disable-next-line max-len
	return `https://github.com/hitabisgmbh/oaklean-windows-sensorinterface/releases/download/v${VERSION}/${platformSpecificPackageName}.zip`
}
