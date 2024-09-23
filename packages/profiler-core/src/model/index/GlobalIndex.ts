import { ModuleIndex } from './ModuleIndex'
import { PathIndex } from './PathIndex'
import { SourceNodeIndex } from './SourceNodeIndex'

import { BaseModel } from '../BaseModel'
import { ModelMap } from '../ModelMap'
import { NodeModule } from '../NodeModule'
import { GlobalIdentifier } from '../../system/GlobalIdentifier'
import { LangInternalPathRegex } from '../../constants/SourceNodeRegex'
// Types
import {
	PathID_number,
	ModuleID_number,
	SourceNodeIndexType,
	SourceNodeID_number,
	NodeModuleIdentifier_string,
	IndexRequestType,
	GlobalIndexType,
	IGlobalIndex
} from '../../types'

export class GlobalIndex extends BaseModel {
	currentId: number
	moduleMap: ModelMap<NodeModuleIdentifier_string, ModuleIndex>
	engineModule: NodeModule

	moduleReverseIndex: ModelMap<number, ModuleIndex>
	pathReverseIndex: ModelMap<number, PathIndex>
	sourceNodeReverseIndex: ModelMap<number, SourceNodeIndex<SourceNodeIndexType.SourceNode>>

	constructor(engineModule: NodeModule, currentId = 0) {
		super()
		this.currentId = currentId
		this.engineModule = engineModule
		this.moduleMap = new ModelMap<NodeModuleIdentifier_string, ModuleIndex>('string')
		this.moduleReverseIndex = new ModelMap<number, ModuleIndex>('number')
		this.pathReverseIndex = new ModelMap<number, PathIndex>('number')
		this.sourceNodeReverseIndex = new ModelMap<number, SourceNodeIndex<SourceNodeIndexType.SourceNode>>('number')
	}

	toBuffer(): Buffer {
		throw new Error('GlobalIndex.toBuffer: not yet implemented')
	}

	toJSON(): IGlobalIndex {
		return {
			currentId: this.currentId,
			moduleMap: this.moduleMap.toJSON() || {}
		}
	}

	static fromJSON(
		json: string | IGlobalIndex,
		engineModule: NodeModule
	): GlobalIndex {
		let data: IGlobalIndex
		if (typeof json === 'string') {
			data = JSON.parse(json)
		} else {
			data = json
		}
		const result = new GlobalIndex(engineModule, data.currentId)

		for (const key of Object.keys(data.moduleMap)) {
			result.moduleMap.set(
				key as NodeModuleIdentifier_string,
				ModuleIndex.fromJSON(
					data.moduleMap[key as NodeModuleIdentifier_string],
					key as NodeModuleIdentifier_string,
					result
				)
			)
		}

		return result
	}

	setReverseIndex<
		T extends GlobalIndexType,
	>
	(
		id: number,
		index: T extends 'module' ? ModuleIndex :
			T extends 'path' ? PathIndex : T extends 'sourceNode' ? SourceNodeIndex<SourceNodeIndexType.SourceNode> : never,
		type: T
	) {
		switch (type) {
			case 'module':
				this.moduleReverseIndex.set(id, index as ModuleIndex)
				break
			case 'path':
				this.pathReverseIndex.set(id, index as PathIndex)
				break
			case 'sourceNode':
				this.sourceNodeReverseIndex.set(id, index as SourceNodeIndex<SourceNodeIndexType.SourceNode>)
				break
		}
	}

	getModuleIndexByID(id: ModuleID_number): ModuleIndex | undefined {
		return this.moduleReverseIndex.get(id)
	}

	getPathIndexByID(id: PathID_number): PathIndex | undefined {
		return this.pathReverseIndex.get(id)
	}

	getSourceNodeIndexByID(id: SourceNodeID_number): SourceNodeIndex<SourceNodeIndexType.SourceNode> | undefined {
		return this.sourceNodeReverseIndex.get(id)
	}

	newId(
		index: ModuleIndex | PathIndex | SourceNodeIndex<SourceNodeIndexType.SourceNode>,
		type: GlobalIndexType,
	): number {
		const id = this.currentId++
		this.setReverseIndex(id, index, type)
		return id
	}

	getLangInternalIndex<
		T extends IndexRequestType,
		R = T extends 'upsert' ? ModuleIndex : (ModuleIndex | undefined)
	>(
		indexRequestType: T
	): R {
		const moduleIdentifier = '{node}' as NodeModuleIdentifier_string
		let moduleIndex: ModuleIndex | undefined = this.moduleMap.get(moduleIdentifier)
		if (moduleIndex === undefined) {
			switch (indexRequestType) {
				case 'get':
					return undefined as R
				case 'upsert':
					moduleIndex = new ModuleIndex(
						moduleIdentifier,
						this
					)
					this.moduleMap.set(moduleIdentifier, moduleIndex)
			}
		}

		return moduleIndex as R
	}

	getModuleIndex<
		T extends IndexRequestType,
		R = T extends 'upsert' ? ModuleIndex : (ModuleIndex | undefined)
	>(
		indexRequestType: T,
		nodeModuleIdentifier?: NodeModuleIdentifier_string
	): R {
		const moduleIdentifier = nodeModuleIdentifier !== undefined ? nodeModuleIdentifier : '{self}' as NodeModuleIdentifier_string

		let moduleIndex: ModuleIndex | undefined = this.moduleMap.get(moduleIdentifier)
		if (moduleIndex === undefined) {
			switch (indexRequestType) {
				case 'get':
					return undefined as R
				case 'upsert':
					moduleIndex = new ModuleIndex(
						moduleIdentifier,
						this
					)
					this.moduleMap.set(moduleIdentifier, moduleIndex)
					break
				default:
					return undefined as R
			}
		}

		return moduleIndex as R
	}

	getSourceNodeIndex<
		T extends IndexRequestType,
		R = T extends 'upsert' ?
			SourceNodeIndex<SourceNodeIndexType.SourceNode> :
			(SourceNodeIndex<SourceNodeIndexType.SourceNode> | undefined)
	>(
		indexRequestType: T,
		identifier: GlobalIdentifier
	): R {
		let moduleIndex = undefined
		if (identifier.path === '' || LangInternalPathRegex.test(identifier.path)) {
			moduleIndex = this.getLangInternalIndex(indexRequestType)
		} else {
			moduleIndex = this.getModuleIndex(indexRequestType, identifier.nodeModule?.identifier)
		}

		return moduleIndex?.getFilePathIndex(indexRequestType, identifier.path)?.
			getSourceNodeIndex(indexRequestType, identifier.sourceNodeIdentifier) as R
	}
}