import * as fs from 'fs'
import path from 'path'

import { CPUModel } from './CPUModel'
import { CPUNode } from './CPUNode'
import { NanoSeconds_BigInt } from './TimeHelper'
import { memoize } from './memoize'
import { TypescriptParser } from './TypescriptParser'
import { TypeScriptHelper } from './TypescriptHelper'

import { Report } from '../model/Report'
import { ProjectReport } from '../model/ProjectReport'
import { ModuleReport } from '../model/ModuleReport'
import { UnifiedPath } from '../system/UnifiedPath'
import { UnifiedPath_string } from '../types/UnifiedPath.types'
import { ICpuProfileRaw } from '../../lib/vscode-js-profile-core/src/cpu/types'
import { BaseAdapter } from '../adapters/transformer/BaseAdapter'
import { MetricsDataCollection } from '../model/interfaces/MetricsDataCollection'
import { TypeScriptAdapter } from '../adapters/transformer/TypeScriptAdapter'
import { ModelMap } from '../model/ModelMap'
import { ProgramStructureTree } from '../model/ProgramStructureTree'
import { IPureCPUTime, IPureCPUEnergyConsumption, IPureRAMEnergyConsumption } from '../model/SensorValues'
import { SourceNodeID_number } from '../model/index/SourceNodeIndex'
import { SourceMap } from '../model/SourceMap'
import {
	SourceNodeMetaData,
	SourceNodeMetaDataType
} from '../model/SourceNodeMetaData'
import {
	LangInternalPath_string,
	LangInternalSourceNodeIdentifier_string,
	SourceNodeIdentifier_string
} from '../types/SourceNodeIdentifiers.types'
import { GlobalIdentifier } from '../system/GlobalIdentifier'
import { MilliJoule_number } from '../model/interfaces/BaseMetricsData'
import { NodeModule } from '../model/NodeModule'

type CallIdentifier = {
	reportID: number,
	sourceNodeID: SourceNodeID_number
}

type LastNodeCallInfo = {
	report: Report,
	sourceNode: SourceNodeMetaData<SourceNodeMetaDataType.SourceNode>,
}

export class InsertCPUProfileHelper {
	static callIdentifierToString(identifier: CallIdentifier) {
		return `${identifier.reportID}:${identifier.sourceNodeID}`
	}

	static markAsAccounted(
		accounted: Map<string, string[]>,
		self: CallIdentifier,
		parent: CallIdentifier
	): boolean {
		let previousChildCalls = accounted.get(InsertCPUProfileHelper.callIdentifierToString(parent))
		let alreadyAccounted = false
		if (previousChildCalls === undefined) {
			previousChildCalls = []
			accounted.set(InsertCPUProfileHelper.callIdentifierToString(parent), previousChildCalls)
		} else {
			alreadyAccounted = previousChildCalls.includes(InsertCPUProfileHelper.callIdentifierToString(self))
		}
		previousChildCalls.push(InsertCPUProfileHelper.callIdentifierToString(self))
		return alreadyAccounted
	}

	// IMPORTANT to change when new measurement type gets added
	static sensorValuesForVisitedNode(
		cpuTime: IPureCPUTime,
		cpuEnergyConsumption: IPureCPUEnergyConsumption,
		ramEnergyConsumption: IPureRAMEnergyConsumption,
		visited: boolean,
	): {
			cpuTime: IPureCPUTime,
			cpuEnergyConsumption: IPureCPUEnergyConsumption,
			ramEnergyConsumption: IPureRAMEnergyConsumption
		} {
		const cpuTimeResult: IPureCPUTime = {
			selfCPUTime: cpuTime.selfCPUTime,
			aggregatedCPUTime: cpuTime.aggregatedCPUTime
		}
		const cpuEnergyConsumptionResult: IPureCPUEnergyConsumption = {
			selfCPUEnergyConsumption: cpuEnergyConsumption.selfCPUEnergyConsumption,
			aggregatedCPUEnergyConsumption: cpuEnergyConsumption.aggregatedCPUEnergyConsumption
		}
		const ramEnergyConsumptionResult: IPureRAMEnergyConsumption = {
			selfRAMEnergyConsumption: ramEnergyConsumption.selfRAMEnergyConsumption,
			aggregatedRAMEnergyConsumption: ramEnergyConsumption.aggregatedRAMEnergyConsumption
		}
		if (visited) {
			cpuTimeResult.aggregatedCPUTime = 0
			cpuEnergyConsumptionResult.aggregatedCPUEnergyConsumption = 0 as MilliJoule_number
			ramEnergyConsumptionResult.aggregatedRAMEnergyConsumption = 0 as MilliJoule_number
		}
		return {
			cpuTime: cpuTimeResult,
			cpuEnergyConsumption: cpuEnergyConsumptionResult,
			ramEnergyConsumption: ramEnergyConsumptionResult
		}
	}

	static async accountToLangInternal(
		cpuNode: CPUNode,
		reportToCredit: Report,
		lastNodeCallInfo: LastNodeCallInfo | undefined,
		accounted: Map<string, string[]>
	) {
		const cpuTime = cpuNode.cpuTime
		const cpuEnergyConsumption = cpuNode.cpuEnergyConsumption
		const ramEnergyConsumption = cpuNode.ramEnergyConsumption

		let firstTimeVisitedSourceNode_CallIdentifier: CallIdentifier | undefined = undefined
		let parentSourceNode_CallIdentifier: CallIdentifier | undefined = undefined
		
		const sourceNodeIdentifier = cpuNode.sourceNodeIdentifier as LangInternalSourceNodeIdentifier_string
		const langInternalPath = cpuNode.rawUrl as LangInternalPath_string

		const sourceNode = reportToCredit.addToLangInternal(
			langInternalPath,
			sourceNodeIdentifier,
		)
		const currentCallIdentifier = {
			reportID: reportToCredit.internID,
			sourceNodeID: sourceNode.id
		}
		const currentCallIdentifierString = InsertCPUProfileHelper.callIdentifierToString(currentCallIdentifier)
		sourceNode.sensorValues.profilerHits += cpuNode.profilerHits
		sourceNode.addToSensorValues(
			InsertCPUProfileHelper.sensorValuesForVisitedNode(
				cpuTime,
				cpuEnergyConsumption,
				ramEnergyConsumption,
				accounted.has(currentCallIdentifierString)
			)
		)

		if (!accounted.has(currentCallIdentifierString)) {
			firstTimeVisitedSourceNode_CallIdentifier = currentCallIdentifier
			accounted.set(currentCallIdentifierString, [])
		}

		if (lastNodeCallInfo) {
			parentSourceNode_CallIdentifier = {
				reportID: lastNodeCallInfo.report.internID,
				sourceNodeID: lastNodeCallInfo.sourceNode.id
			}
			const alreadyAccounted = InsertCPUProfileHelper.markAsAccounted(
				accounted,
				{
					reportID: reportToCredit.internID,
					sourceNodeID: sourceNode.id
				},
				parentSourceNode_CallIdentifier
			)
			const langInternalSourceNodeReference = lastNodeCallInfo.sourceNode.addSensorValuesToLangInternal(
				sourceNode.globalIdentifier(),
				InsertCPUProfileHelper.sensorValuesForVisitedNode(
					cpuTime,
					cpuEnergyConsumption,
					ramEnergyConsumption,
					alreadyAccounted
				)
			)
			langInternalSourceNodeReference.sensorValues.profilerHits += cpuNode.profilerHits
		}

		return {
			firstTimeVisitedSourceNode_CallIdentifier,
			parentSourceNode_CallIdentifier
		}
	}

	static async accountOwnCodeGetsExecutedByExternal(
		cpuNode: CPUNode,
		originalReport: Report,
		functionIdentifier: SourceNodeIdentifier_string,
		relativeOriginalSourcePath: UnifiedPath | undefined,
		lastNodeCallInfo: LastNodeCallInfo,
		accounted: Map<string, string[]>
	) {
		const cpuTime = cpuNode.cpuTime
		const cpuEnergyConsumption = cpuNode.cpuEnergyConsumption
		const ramEnergyConsumption = cpuNode.ramEnergyConsumption

		let newReportToCredit: Report | undefined = undefined
		let firstTimeVisitedSourceNode_CallIdentifier: CallIdentifier | undefined = undefined
		let parentSourceNode_CallIdentifier: CallIdentifier | undefined = undefined

		const newLastInternSourceNode = originalReport.addToIntern(
			cpuNode.relativeSourceFilePath.toString(),
			functionIdentifier,
		)
		const currentCallIdentifier = {
			reportID: originalReport.internID,
			sourceNodeID: newLastInternSourceNode.id
		}
		const currentCallIdentifierString = InsertCPUProfileHelper.callIdentifierToString(
			currentCallIdentifier)
		newLastInternSourceNode.sensorValues.profilerHits += cpuNode.profilerHits
		// add measurements to original source code
		newLastInternSourceNode.addToSensorValues(
			InsertCPUProfileHelper.sensorValuesForVisitedNode(
				cpuTime,
				cpuEnergyConsumption,
				ramEnergyConsumption,
				accounted.has(currentCallIdentifierString)
			)
		)
		if (!accounted.has(currentCallIdentifierString)) {
			firstTimeVisitedSourceNode_CallIdentifier = currentCallIdentifier
			accounted.set(currentCallIdentifierString, [])
		}

		// remove aggregated time from last intern source node
		parentSourceNode_CallIdentifier = {
			reportID: lastNodeCallInfo.report.internID,
			sourceNodeID: lastNodeCallInfo.sourceNode.id
		}
		// parent caller was already accounted once, so don't subtract the cpu time from it again
		const sensorValuesCorrected = InsertCPUProfileHelper.sensorValuesForVisitedNode(
			cpuTime,
			cpuEnergyConsumption,
			ramEnergyConsumption,
			accounted.has(InsertCPUProfileHelper.callIdentifierToString(parentSourceNode_CallIdentifier)) &&
			accounted.get(InsertCPUProfileHelper.callIdentifierToString(
				parentSourceNode_CallIdentifier))!.length > 0
		)

		// IMPORTANT to change when new measurement type gets added
		lastNodeCallInfo.sourceNode.sensorValues.aggregatedCPUTime -=
			(sensorValuesCorrected.cpuTime.aggregatedCPUTime || 0)
		lastNodeCallInfo.sourceNode.sensorValues.aggregatedCPUEnergyConsumption =
			lastNodeCallInfo.sourceNode.sensorValues.aggregatedCPUEnergyConsumption -
			(sensorValuesCorrected.
				cpuEnergyConsumption.
				aggregatedCPUEnergyConsumption
				|| 0) as MilliJoule_number
		lastNodeCallInfo.sourceNode.sensorValues.aggregatedRAMEnergyConsumption =
			lastNodeCallInfo.sourceNode.sensorValues.aggregatedRAMEnergyConsumption -
			(sensorValuesCorrected.
				ramEnergyConsumption.
				aggregatedRAMEnergyConsumption
				|| 0) as MilliJoule_number

		// set call as accounted
		InsertCPUProfileHelper.markAsAccounted(
			accounted,
			currentCallIdentifier,
			parentSourceNode_CallIdentifier
		)

		if (relativeOriginalSourcePath) {
			originalReport.addSourceFileMapLink(
				cpuNode.relativeSourceFilePath,
				relativeOriginalSourcePath
			)
		}
		newReportToCredit = originalReport // reset report back to the orignal report

		return {
			newReportToCredit,
			newLastInternSourceNode,
			firstTimeVisitedSourceNode_CallIdentifier,
			parentSourceNode_CallIdentifier
		}
	}

	static async accountToIntern(
		reportToCredit: Report,
		cpuNode: CPUNode,
		functionIdentifier: SourceNodeIdentifier_string,
		relativeOriginalSourcePath: UnifiedPath | undefined,
		lastNodeCallInfo: LastNodeCallInfo | undefined,
		awaiterStack: SourceNodeMetaData<SourceNodeMetaDataType.SourceNode>[],
		accounted: Map<string, string[]>
	) {
		const cpuTime = cpuNode.cpuTime
		const cpuEnergyConsumption = cpuNode.cpuEnergyConsumption
		const ramEnergyConsumption = cpuNode.ramEnergyConsumption

		let isAwaiterSourceNode = false
		let firstTimeVisitedSourceNode_CallIdentifier: CallIdentifier | undefined = undefined
		let parentSourceNode_CallIdentifier: CallIdentifier | undefined = undefined

		// intern
		const newLastInternSourceNode = reportToCredit.addToIntern(
			cpuNode.relativeSourceFilePath.toString(),
			functionIdentifier
		)
		const currentCallIdentifier = {
			reportID: reportToCredit.internID,
			sourceNodeID: newLastInternSourceNode.id
		}
		const currentCallIdentifierString = InsertCPUProfileHelper.callIdentifierToString(
			currentCallIdentifier)
		newLastInternSourceNode.sensorValues.profilerHits += cpuNode.profilerHits
		newLastInternSourceNode.addToSensorValues(
			InsertCPUProfileHelper.sensorValuesForVisitedNode(
				cpuTime,
				cpuEnergyConsumption,
				ramEnergyConsumption,
				accounted.has(currentCallIdentifierString))
		)

		if (!accounted.has(currentCallIdentifierString)) {
			firstTimeVisitedSourceNode_CallIdentifier = currentCallIdentifier
			accounted.set(currentCallIdentifierString, [])
		}

		if (functionIdentifier === TypeScriptHelper.awaiterSourceNodeIdentifier()) {
			isAwaiterSourceNode = true
			awaiterStack.push(newLastInternSourceNode)
		}

		const awaiterSourceNodeIndex = newLastInternSourceNode.getIndex()?.pathIndex.getSourceNodeIndex(
			'get',
			'{root}.{functionExpression:__awaiter}' as SourceNodeIdentifier_string,
		)

		if (
			!isAwaiterSourceNode &&
			awaiterSourceNodeIndex &&
			accounted.has(
				InsertCPUProfileHelper.callIdentifierToString({
					reportID: reportToCredit.internID,
					sourceNodeID: awaiterSourceNodeIndex.id
				}))
		) {
			/*
				The current source node is not an awaiter
				but there is an awaiter in the source file and the current source node was called by it.
				If the current source node was already using the awaiter (as an intern call) in the call tree,
				subtract the current aggregated measurements, since they are already accounted
			*/
			const lastAwaiterNode = awaiterStack[awaiterStack.length - 1]
			if (lastAwaiterNode === undefined) {
				throw new Error('InsertCPUProfileHelper.accountToIntern: expected an awaiter in awaiterStack')
			}
			if (lastAwaiterNode !== lastNodeCallInfo?.sourceNode) {
				const awaiterInternChild = newLastInternSourceNode.intern.get(
					awaiterSourceNodeIndex.id
				)
				if (awaiterInternChild !== undefined) {
					// IMPORTANT to change when new measurement type gets added
					awaiterInternChild.
						sensorValues.
						aggregatedCPUTime -= (cpuTime.aggregatedCPUTime || 0)
					awaiterInternChild.
						sensorValues.
						aggregatedCPUEnergyConsumption = awaiterInternChild.
							sensorValues.
							aggregatedCPUEnergyConsumption -
							(cpuEnergyConsumption.aggregatedCPUEnergyConsumption || 0) as MilliJoule_number
					awaiterInternChild.
						sensorValues.
						aggregatedRAMEnergyConsumption = awaiterInternChild.
							sensorValues.
							aggregatedRAMEnergyConsumption -
							(cpuEnergyConsumption.aggregatedCPUEnergyConsumption || 0) as MilliJoule_number

					// IMPORTANT to change when new measurement type gets added
					newLastInternSourceNode.sensorValues.internCPUTime -=
						(cpuTime.aggregatedCPUTime || 0)
					
					newLastInternSourceNode.sensorValues.internCPUEnergyConsumption =
						newLastInternSourceNode.sensorValues.internCPUEnergyConsumption -
						(cpuEnergyConsumption.aggregatedCPUEnergyConsumption || 0) as MilliJoule_number
					
					newLastInternSourceNode.sensorValues.internRAMEnergyConsumption =
						newLastInternSourceNode.sensorValues.internRAMEnergyConsumption -
						(ramEnergyConsumption.aggregatedRAMEnergyConsumption || 0) as MilliJoule_number
				}
			}
		}

		if (relativeOriginalSourcePath) {
			reportToCredit.addSourceFileMapLink(
				cpuNode.relativeSourceFilePath,
				relativeOriginalSourcePath
			)
		}

		if (lastNodeCallInfo && lastNodeCallInfo.sourceNode !== newLastInternSourceNode) {
			parentSourceNode_CallIdentifier = {
				reportID: lastNodeCallInfo.report.internID,
				sourceNodeID: lastNodeCallInfo.sourceNode.id
			}
			const alreadyAccounted = InsertCPUProfileHelper.markAsAccounted(
				accounted,
				currentCallIdentifier,
				parentSourceNode_CallIdentifier
			)

			const internSourceNodeReference = lastNodeCallInfo.sourceNode.addSensorValuesToIntern(
				newLastInternSourceNode.globalIdentifier(),
				InsertCPUProfileHelper.sensorValuesForVisitedNode(
					cpuTime,
					cpuEnergyConsumption,
					ramEnergyConsumption,
					alreadyAccounted
				)
			)
			internSourceNodeReference.sensorValues.profilerHits += cpuNode.profilerHits
		}

		return {
			isAwaiterSourceNode,
			firstTimeVisitedSourceNode_CallIdentifier,
			parentSourceNode_CallIdentifier,
			newLastInternSourceNode
		}
	}

	static async accountToExtern(
		reportToCredit: Report,
		cpuNode: CPUNode,
		nodeModule: NodeModule,
		functionIdentifier: SourceNodeIdentifier_string,
		relativeOriginalSourcePath: UnifiedPath | undefined,
		lastNodeCallInfo: LastNodeCallInfo | undefined,
		accounted: Map<string, string[]>
	) {
		const cpuTime = cpuNode.cpuTime
		const cpuEnergyConsumption = cpuNode.cpuEnergyConsumption
		const ramEnergyConsumption = cpuNode.ramEnergyConsumption
		let firstTimeVisitedSourceNode_CallIdentifier: CallIdentifier | undefined = undefined
		let parentSourceNode_CallIdentifier: CallIdentifier | undefined = undefined

		const globalIdentifier = new GlobalIdentifier(
			cpuNode.relativeSourceFilePath.toString(),
			functionIdentifier,
			nodeModule
		)

		// extern
		const { report, sourceNodeMetaData } = reportToCredit.addToExtern(
			cpuNode.relativeSourceFilePath,
			nodeModule,
			functionIdentifier
		)
		const newReportToCredit = report
		const newLastInternSourceNode = sourceNodeMetaData
		const currentCallIdentifier = {
			reportID: report.internID,
			sourceNodeID: sourceNodeMetaData.id
		}
		const currentCallIdentifierString = InsertCPUProfileHelper.callIdentifierToString(
			currentCallIdentifier)
		sourceNodeMetaData.sensorValues.profilerHits += cpuNode.profilerHits
		sourceNodeMetaData.addToSensorValues(
			InsertCPUProfileHelper.sensorValuesForVisitedNode(
				cpuTime,
				cpuEnergyConsumption,
				ramEnergyConsumption,
				accounted.has(currentCallIdentifierString)
			)
		)
		if (!accounted.has(currentCallIdentifierString)) {
			firstTimeVisitedSourceNode_CallIdentifier = currentCallIdentifier
			accounted.set(currentCallIdentifierString, [])
		}

		if (lastNodeCallInfo) {
			parentSourceNode_CallIdentifier = {
				reportID: lastNodeCallInfo.report.internID,
				sourceNodeID: lastNodeCallInfo.sourceNode.id
			}
			const alreadyAccounted = InsertCPUProfileHelper.markAsAccounted(
				accounted,
				currentCallIdentifier,
				parentSourceNode_CallIdentifier
			)
			// add to this source node as well
			const externSourceNodeReference = lastNodeCallInfo.sourceNode.addSensorValuesToExtern(
				globalIdentifier,
				InsertCPUProfileHelper.sensorValuesForVisitedNode(
					cpuTime,
					cpuEnergyConsumption,
					ramEnergyConsumption,
					alreadyAccounted
				)
			)
			externSourceNodeReference.sensorValues.profilerHits += cpuNode.profilerHits
		}

		if (relativeOriginalSourcePath) {
			newReportToCredit.addSourceFileMapLink(
				cpuNode.relativeSourceFilePath,
				relativeOriginalSourcePath
			)
		}

		return {
			parentSourceNode_CallIdentifier,
			firstTimeVisitedSourceNode_CallIdentifier,
			newLastInternSourceNode,
			newReportToCredit
		}
	}

	static async resolveFunctionIdentifier(
		rootDir: UnifiedPath,
		cpuNode: CPUNode,
		programStructureTreePerFile: ModelMap<UnifiedPath_string, ProgramStructureTree>,
		programStructureTreePerOriginalFile: ModelMap<UnifiedPath_string, ProgramStructureTree>,
		transformerAdapterToUse: BaseAdapter,
		getSourceMapOfFile: (filePath: UnifiedPath) => SourceMap | undefined,
		getSourceMapFromSourceCode: (filePath: UnifiedPath, sourceCode: string) => SourceMap | undefined,
	) {
		/**
		 * Resolve procedure:
		 * 
		 * if file "dir/dir/file.ext" is transformable
		 * 	- store transformed source code at programStructureTreePerFile["dir/dir/file.ext"]
		 * 	- store original source code at
		 * 		programStructureTreePerOriginalFile["_ORIGINAL_dir/dir/file.ext"]
		 * else: (file is already transformed)
		 * 	- store transformed source code at
		 * 		programStructureTreePerFile["dir/dir/file.ext"]
		 *  - get source map of transformed file
		 * 	- store original source code at
		 * 		programStructureTreePerOriginalFile[path.resolve("dir/dir/" + sourcemap.source)]
		 */

		let sourceMap = undefined
		let programStructureTree = undefined
		let programStructureTreeOriginal = undefined
		programStructureTree = programStructureTreePerFile.get(cpuNode.relativeUrl.toString())
		const shouldBeTransformed = await transformerAdapterToUse.shouldProcess(cpuNode.url)
		const { lineNumber, columnNumber } = cpuNode.sourceLocation

		if (shouldBeTransformed) {
			const originalFilePath = '_ORIGINAL_' + cpuNode.relativeUrl.toString() as UnifiedPath_string
			programStructureTreeOriginal = programStructureTreePerOriginalFile.get(
				originalFilePath
			)
			if (programStructureTree === undefined) {
				const transformedSourceCode = await transformerAdapterToUse.process(cpuNode.url)
				if (!transformedSourceCode) {
					throw new Error('InsertCPUProfileHelper.resolveFunctionIdentifier Could not transform source code from: ' + cpuNode.url.toString())
				}

				programStructureTree = TypescriptParser.parseSource(
					cpuNode.javascriptUrl,
					transformedSourceCode
				)
				programStructureTreePerFile.set(cpuNode.relativeUrl.toString(), programStructureTree)
				sourceMap = getSourceMapFromSourceCode(cpuNode.javascriptUrl, transformedSourceCode)
			}
			if (programStructureTreeOriginal === undefined) {
				programStructureTreeOriginal = TypescriptParser.parseFile(cpuNode.url)
				programStructureTreePerOriginalFile.set(
					originalFilePath,
					programStructureTreeOriginal
				)
			}
		} else {
			if (programStructureTree === undefined) {
				programStructureTree = TypescriptParser.parseFile(cpuNode.url)
				programStructureTreePerFile.set(cpuNode.relativeUrl.toString(), programStructureTree)
			}

			sourceMap = getSourceMapOfFile(cpuNode.url)

			const originalPosition = sourceMap?.getOriginalSourceLocation(lineNumber, columnNumber)
			if (originalPosition && originalPosition.source) {
				const absoluteOriginalSourcePath = new UnifiedPath(
					path.resolve(path.join(path.dirname(cpuNode.url.toString()), originalPosition.source))
				)
				const pureRelativeOriginalSourcePath = rootDir.pathTo(absoluteOriginalSourcePath)
				programStructureTreeOriginal = programStructureTreePerOriginalFile.get(
					pureRelativeOriginalSourcePath.toString()
				)
				if (programStructureTreeOriginal === undefined) {
					programStructureTreeOriginal = TypescriptParser.parseFile(absoluteOriginalSourcePath)
					programStructureTreePerOriginalFile.set(
						pureRelativeOriginalSourcePath.toString(),
						programStructureTreeOriginal
					)
				}

			}
			if (programStructureTreeOriginal === undefined) {
				programStructureTreeOriginal = programStructureTree
			}
		}

		const functionIdentifier = programStructureTree.identifierBySourceLocation(
			{ line: lineNumber, column: columnNumber }
		)

		const functionIdentifierPresentInOriginalFile = programStructureTree === programStructureTreeOriginal ?
			true : (programStructureTreeOriginal.sourceLocationOfIdentifier(functionIdentifier) !== undefined)

		if (functionIdentifier === '') {
			console.error('InsertCPUProfileHelper.resolveFunctionIdentifier: functionIdentifier should not be empty', {
				url: cpuNode.url.toString(),
				lineNumber,
				columnNumber
			})
			throw new Error('InsertCPUProfileHelper.resolveFunctionIdentifier: functionIdentifier should not be empty')
		}

		sourceMap = sourceMap ? sourceMap : getSourceMapOfFile(cpuNode.url)
		const originalPosition = sourceMap?.getOriginalSourceLocation(lineNumber, columnNumber)
		let relativeOriginalSourcePath = undefined

		if (originalPosition && originalPosition.source) {
			// add the profiler information for the original source file as well
			const absoluteOriginalSourcePath = new UnifiedPath(
				path.resolve(path.join(path.dirname(cpuNode.url.toString()), originalPosition.source))
			)

			const pureRelativeOriginalSourcePath = rootDir.pathTo(absoluteOriginalSourcePath)
			relativeOriginalSourcePath = (cpuNode.nodeModulePath && cpuNode.nodeModule)
				? cpuNode.nodeModulePath.pathTo(pureRelativeOriginalSourcePath) : pureRelativeOriginalSourcePath
		}

		return {
			functionIdentifier,
			relativeOriginalSourcePath,
			functionIdentifierPresentInOriginalFile
		}
	}

	static async insertCPUProfile(
		reportToApply: ProjectReport,
		rootDir: UnifiedPath,
		profile: ICpuProfileRaw,
		transformerAdapter?: BaseAdapter,
		metricsDataCollection?: MetricsDataCollection
	) {
		if (reportToApply.executionDetails.highResolutionBeginTime === undefined) {
			throw new Error('InsertCPUProfileHelper.insertCPUProfile: executionDetails.highResolutionBeginTime is undefined')
		}
		const cpuModel = new CPUModel(
			rootDir,
			profile,
			BigInt(reportToApply.executionDetails.highResolutionBeginTime) as NanoSeconds_BigInt
		)

		let transformerAdapterToUse: BaseAdapter
		if (transformerAdapter) {
			transformerAdapterToUse = transformerAdapter
		} else {
			transformerAdapterToUse = new TypeScriptAdapter()
		}

		const getSourceMapOfFile = memoize(SourceMap.fromCompiledJSFile)
		const getSourceMapFromSourceCode = memoize(SourceMap.fromCompiledJSString)

		const programStructureTreePerFile: ModelMap<UnifiedPath_string, ProgramStructureTree> =
			new ModelMap<UnifiedPath_string, ProgramStructureTree>('string')
		
		const programStructureTreePerOriginalFile: ModelMap<UnifiedPath_string, ProgramStructureTree> =
			new ModelMap<UnifiedPath_string, ProgramStructureTree>('string')

		if (metricsDataCollection && metricsDataCollection.items.length > 0) {
			// fill the cpu model with energy values
			cpuModel.energyValuesPerNode = cpuModel.energyValuesPerNodeByMetricsData(metricsDataCollection)
		}
		const awaiterStack: SourceNodeMetaData<SourceNodeMetaDataType.SourceNode>[] = []
		/**
		 * 
		 * @param reportToCredit the ProjectReport that is used to store the measurements
		 * @param node current node in the call tree 
		 * 
		 * @param accounted Source Node (call identifier) already includes
		 * 		subCalls of: (call identifier)[]
		 */
		async function traverse(
			originalReport: Report,
			reportToCredit: Report,
			cpuNode: CPUNode,
			lastNodeCallInfo: {
				report: Report,
				sourceNode: SourceNodeMetaData<SourceNodeMetaDataType.SourceNode>,
			} | undefined,
			accounted: Map<string, string[]>
		) {
			if (!cpuNode.isExtern && !cpuNode.isLangInternal) {
				reportToCredit = originalReport
			}
			const sourceFileExists =
				fs.existsSync(cpuNode.url.toString()) && fs.statSync(cpuNode.url.toString()).isFile()

			if (!cpuNode.isEmpty && !cpuNode.isLangInternal && !sourceFileExists) {
				throw new Error('InsertCPUProfileHelper.insertCPUProfile.traverse: Sourcefile does not exist: ' + cpuNode.url)
			}

			let firstTimeVisitedSourceNode_CallIdentifier: CallIdentifier | undefined = undefined
			let parentSourceNode_CallIdentifier: CallIdentifier | undefined = undefined
			let isAwaiterSourceNode = false
			let newLastInternSourceNode: SourceNodeMetaData<SourceNodeMetaDataType.SourceNode> | undefined = undefined
			let newReportToCredit: Report | undefined = undefined
			if (cpuNode.isLangInternal) {
				const result = await InsertCPUProfileHelper.accountToLangInternal(
					cpuNode,
					reportToCredit,
					lastNodeCallInfo,
					accounted
				)
				firstTimeVisitedSourceNode_CallIdentifier = result.firstTimeVisitedSourceNode_CallIdentifier
				parentSourceNode_CallIdentifier = result.parentSourceNode_CallIdentifier
			} else if (!cpuNode.isEmpty) {
				const {
					functionIdentifier,
					relativeOriginalSourcePath,
					functionIdentifierPresentInOriginalFile
				} = await InsertCPUProfileHelper.resolveFunctionIdentifier(
					rootDir,
					cpuNode,
					programStructureTreePerFile,
					programStructureTreePerOriginalFile,
					transformerAdapterToUse,
					getSourceMapOfFile,
					getSourceMapFromSourceCode
				)

				// add to intern if the source file is not part of a node module
				// or the reportToCredit is the node module that source file belongs to
				const addToIntern =
					!((cpuNode.nodeModulePath && cpuNode.nodeModule))
					|| (
						reportToCredit instanceof ModuleReport
						&& reportToCredit.nodeModule.identifier === cpuNode.nodeModule.identifier
					)

				// this happens for node modules like the jest-runner, that executes the own code
				// the measurements will be credited to the original code rather than the node module that executes it
				const ownCodeGetsExecutedByExternal = cpuNode.nodeModulePath === null &&
					lastNodeCallInfo &&
					lastNodeCallInfo.sourceNode.sourceNodeIndex.pathIndex.moduleIndex.identifier !== '{self}'

				if (ownCodeGetsExecutedByExternal) {
					const result = await InsertCPUProfileHelper.accountOwnCodeGetsExecutedByExternal(
						cpuNode,
						originalReport,
						functionIdentifier,
						relativeOriginalSourcePath,
						lastNodeCallInfo,
						accounted
					)
					newReportToCredit = result.newReportToCredit
					newLastInternSourceNode = result.newLastInternSourceNode
					firstTimeVisitedSourceNode_CallIdentifier = result.firstTimeVisitedSourceNode_CallIdentifier
					parentSourceNode_CallIdentifier = result.parentSourceNode_CallIdentifier
				} else {
					if (addToIntern) {
						const result = await InsertCPUProfileHelper.accountToIntern(
							reportToCredit,
							cpuNode,
							functionIdentifier,
							relativeOriginalSourcePath,
							lastNodeCallInfo,
							awaiterStack,
							accounted
						)
						isAwaiterSourceNode = result.isAwaiterSourceNode
						firstTimeVisitedSourceNode_CallIdentifier = result.firstTimeVisitedSourceNode_CallIdentifier
						parentSourceNode_CallIdentifier = result.parentSourceNode_CallIdentifier
						newLastInternSourceNode = result.newLastInternSourceNode
					} else {
						const result = await InsertCPUProfileHelper.accountToExtern(
							reportToCredit,
							cpuNode,
							cpuNode.nodeModule,
							functionIdentifier,
							relativeOriginalSourcePath,
							lastNodeCallInfo,
							accounted
						)

						parentSourceNode_CallIdentifier = result.parentSourceNode_CallIdentifier
						firstTimeVisitedSourceNode_CallIdentifier = result.firstTimeVisitedSourceNode_CallIdentifier
						newLastInternSourceNode = result.newLastInternSourceNode
						newReportToCredit = result.newReportToCredit
					}
				}

				newLastInternSourceNode.presentInOriginalSourceCode = functionIdentifierPresentInOriginalFile
			}

			for (const child of cpuNode.children()) {
				await traverse(
					originalReport,
					newReportToCredit ? newReportToCredit : reportToCredit,
					child,
					newLastInternSourceNode !== undefined ? {
						report: reportToCredit,
						sourceNode: newLastInternSourceNode
					} : undefined,
					accounted
				)
			}
			// equivalent to leave node since after child traverse
			if (parentSourceNode_CallIdentifier) {
				const childCalls = accounted.get(InsertCPUProfileHelper.callIdentifierToString(
					parentSourceNode_CallIdentifier))
				if (childCalls === undefined) {
					throw new Error('InsertCPUProfileHelper.insertCPUProfile.traverse: expected childCalls to be present')
				}
				childCalls.pop() // remove self from parent
			}
			if (firstTimeVisitedSourceNode_CallIdentifier !== undefined) {
				accounted.delete(InsertCPUProfileHelper.callIdentifierToString(
					firstTimeVisitedSourceNode_CallIdentifier))
			}
			if (isAwaiterSourceNode) {
				awaiterStack.pop()
			}
		}

		await traverse(
			reportToApply,
			reportToApply,
			cpuModel.getNode(0),
			undefined,
			new Map<string, string[]>
		)
	}
}