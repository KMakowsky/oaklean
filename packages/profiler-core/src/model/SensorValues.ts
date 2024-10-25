import { BaseModel } from './BaseModel'

import { BufferHelper } from '../helper/BufferHelper'
// Types
import {
	UnifiedPath_string,
	LangInternalPath_string,
	SourceNodeIdentifier_string,
	MilliJoule_number,
	PrimitiveBufferTypes,
	SensorValueToDataTypeMap,
	ISensorValues,
	MicroSeconds_number
} from '../types'

export const SENSOR_VALUES_BYTE_SIZE_MAP: SensorValueToDataTypeMap = {
	profilerHits: PrimitiveBufferTypes.UInt,

	selfCPUTime: PrimitiveBufferTypes.UInt,
	aggregatedCPUTime: PrimitiveBufferTypes.UInt,
	internCPUTime: PrimitiveBufferTypes.UInt,
	externCPUTime: PrimitiveBufferTypes.UInt,
	langInternalCPUTime: PrimitiveBufferTypes.UInt,

	selfCPUEnergyConsumption: PrimitiveBufferTypes.Double,
	aggregatedCPUEnergyConsumption: PrimitiveBufferTypes.Double,
	internCPUEnergyConsumption: PrimitiveBufferTypes.Double,
	externCPUEnergyConsumption: PrimitiveBufferTypes.Double,
	langInternalCPUEnergyConsumption: PrimitiveBufferTypes.Double,

	selfRAMEnergyConsumption: PrimitiveBufferTypes.Double,
	aggregatedRAMEnergyConsumption: PrimitiveBufferTypes.Double,
	internRAMEnergyConsumption: PrimitiveBufferTypes.Double,
	externRAMEnergyConsumption: PrimitiveBufferTypes.Double,
	langInternalRAMEnergyConsumption: PrimitiveBufferTypes.Double,
}

export class SensorValues extends BaseModel {
	[key: string]: any

	private _profilerHits?: number
	private _selfCPUTime?: MicroSeconds_number
	private _aggregatedCPUTime?: MicroSeconds_number
	private _internCPUTime?: MicroSeconds_number
	private _externCPUTime?: MicroSeconds_number
	private _langInternalCPUTime?: MicroSeconds_number

	private _selfCPUEnergyConsumption?: MilliJoule_number
	private _aggregatedCPUEnergyConsumption?: MilliJoule_number
	private _internCPUEnergyConsumption?: MilliJoule_number
	private _externCPUEnergyConsumption?: MilliJoule_number
	private _langInternalCPUEnergyConsumption?: MilliJoule_number

	private _selfRAMEnergyConsumption?: MilliJoule_number
	private _aggregatedRAMEnergyConsumption?: MilliJoule_number
	private _internRAMEnergyConsumption?: MilliJoule_number
	private _externRAMEnergyConsumption?: MilliJoule_number
	private _langInternalRAMEnergyConsumption?: MilliJoule_number


	constructor(
		{
			profilerHits,

			selfCPUTime,
			aggregatedCPUTime,
			internCPUTime,
			externCPUTime,
			langInternalCPUTime,

			selfCPUEnergyConsumption,
			aggregatedCPUEnergyConsumption,
			internCPUEnergyConsumption,
			externCPUEnergyConsumption,
			langInternalCPUEnergyConsumption,

			selfRAMEnergyConsumption,
			aggregatedRAMEnergyConsumption,
			internRAMEnergyConsumption,
			externRAMEnergyConsumption,
			langInternalRAMEnergyConsumption
		}: ISensorValues
	) {
		super()
		this._profilerHits = profilerHits

		this._selfCPUTime = selfCPUTime
		this._aggregatedCPUTime = aggregatedCPUTime
		this._internCPUTime = internCPUTime
		this._externCPUTime = externCPUTime
		this._langInternalCPUTime = langInternalCPUTime

		this._selfCPUEnergyConsumption = selfCPUEnergyConsumption
		this._aggregatedCPUEnergyConsumption = aggregatedCPUEnergyConsumption
		this._internCPUEnergyConsumption = internCPUEnergyConsumption
		this._externCPUEnergyConsumption = externCPUEnergyConsumption
		this._langInternalCPUEnergyConsumption = langInternalCPUEnergyConsumption

		this._selfRAMEnergyConsumption = selfRAMEnergyConsumption
		this._aggregatedRAMEnergyConsumption = aggregatedRAMEnergyConsumption
		this._internRAMEnergyConsumption = internRAMEnergyConsumption
		this._externRAMEnergyConsumption = externRAMEnergyConsumption
		this._langInternalRAMEnergyConsumption = langInternalRAMEnergyConsumption
	}
	public set profilerHits(v : number) {
		this._profilerHits = v
	}
	public get profilerHits(): number {
		return this._profilerHits || 0
	}

	// CPU Time
	public set selfCPUTime(v: MicroSeconds_number) {
		this._selfCPUTime = v
	}
	public get selfCPUTime(): MicroSeconds_number {
		return this._selfCPUTime || 0 as MicroSeconds_number
	}
	public set aggregatedCPUTime(v: MicroSeconds_number) {
		this._aggregatedCPUTime = v
	}
	public get aggregatedCPUTime(): MicroSeconds_number {
		return this._aggregatedCPUTime || 0 as MicroSeconds_number
	}
	public set internCPUTime(v: MicroSeconds_number) {
		this._internCPUTime = v
	}
	public get internCPUTime(): MicroSeconds_number {
		return this._internCPUTime || 0 as MicroSeconds_number
	}
	public set externCPUTime(v: MicroSeconds_number) {
		this._externCPUTime = v
	}
	public get externCPUTime(): MicroSeconds_number {
		return this._externCPUTime || 0 as MicroSeconds_number
	}
	public set langInternalCPUTime(v: MicroSeconds_number) {
		this._langInternalCPUTime = v
	}
	public get langInternalCPUTime(): MicroSeconds_number {
		return this._langInternalCPUTime || 0 as MicroSeconds_number
	}	

	// CPU Energy
	public set selfCPUEnergyConsumption(v: MilliJoule_number) {
		this._selfCPUEnergyConsumption = v
	}
	public get selfCPUEnergyConsumption(): MilliJoule_number {
		return this._selfCPUEnergyConsumption || 0 as MilliJoule_number
	}

	public set aggregatedCPUEnergyConsumption(v: MilliJoule_number) {
		this._aggregatedCPUEnergyConsumption = v
	}
	public get aggregatedCPUEnergyConsumption(): MilliJoule_number {
		return this._aggregatedCPUEnergyConsumption || 0 as MilliJoule_number
	}

	public set internCPUEnergyConsumption(v: MilliJoule_number) {
		this._internCPUEnergyConsumption = v
	}
	public get internCPUEnergyConsumption(): MilliJoule_number {
		return this._internCPUEnergyConsumption || 0 as MilliJoule_number
	}

	public set externCPUEnergyConsumption(v: MilliJoule_number) {
		this._externCPUEnergyConsumption = v
	}
	public get externCPUEnergyConsumption(): MilliJoule_number {
		return this._externCPUEnergyConsumption || 0 as MilliJoule_number
	}

	public set langInternalCPUEnergyConsumption(v: MilliJoule_number) {
		this._langInternalCPUEnergyConsumption = v
	}
	public get langInternalCPUEnergyConsumption(): MilliJoule_number {
		return this._langInternalCPUEnergyConsumption || 0 as MilliJoule_number
	}

	// RAM Energy
	public set selfRAMEnergyConsumption(v: MilliJoule_number) {
		this._selfRAMEnergyConsumption = v
	}
	public get selfRAMEnergyConsumption(): MilliJoule_number {
		return this._selfRAMEnergyConsumption || 0 as MilliJoule_number
	}

	public set aggregatedRAMEnergyConsumption(v: MilliJoule_number) {
		this._aggregatedRAMEnergyConsumption = v
	}
	public get aggregatedRAMEnergyConsumption(): MilliJoule_number {
		return this._aggregatedRAMEnergyConsumption || 0 as MilliJoule_number
	}

	public set internRAMEnergyConsumption(v: MilliJoule_number) {
		this._internRAMEnergyConsumption = v
	}
	public get internRAMEnergyConsumption(): MilliJoule_number {
		return this._internRAMEnergyConsumption || 0 as MilliJoule_number
	}

	public set externRAMEnergyConsumption(v: MilliJoule_number) {
		this._externRAMEnergyConsumption = v
	}
	public get externRAMEnergyConsumption(): MilliJoule_number {
		return this._externRAMEnergyConsumption || 0 as MilliJoule_number
	}

	public set langInternalRAMEnergyConsumption(v: MilliJoule_number) {
		this._langInternalRAMEnergyConsumption = v
	}
	public get langInternalRAMEnergyConsumption(): MilliJoule_number {
		return this._langInternalRAMEnergyConsumption || 0 as MilliJoule_number
	}

	public validate(
		path: UnifiedPath_string | LangInternalPath_string,
		identifier: SourceNodeIdentifier_string
	) {
		const valid = (
			this.profilerHits >= 0 &&

			this.selfCPUTime >= 0 &&
			this.aggregatedCPUTime >= 0 &&
			this.internCPUTime >= 0 &&
			this.externCPUTime >= 0 &&
			this.langInternalCPUTime >= 0 &&

			this.selfCPUEnergyConsumption >= 0 &&
			this.aggregatedCPUEnergyConsumption >= 0 &&
			this.internCPUEnergyConsumption >= 0 &&
			this.externCPUEnergyConsumption >= 0 &&
			this.langInternalCPUEnergyConsumption >= 0,

			this.selfRAMEnergyConsumption >= 0 &&
			this.aggregatedRAMEnergyConsumption >= 0 &&
			this.internRAMEnergyConsumption >= 0 &&
			this.externRAMEnergyConsumption >= 0 &&
			this.langInternalRAMEnergyConsumption >= 0
		)

		if (!valid) {
			throw new Error(
				`SourceNodeMetaData.validate: Assertion error (SourceNode validation) ${path}:${identifier} \n` +
				JSON.stringify(this, null, 2) + '\n')
		}
	}

	public static sum(...args: SensorValues[]): SensorValues {
		const result = new SensorValues({})

		for (const sensorValues of args) {
			result.profilerHits += sensorValues.profilerHits

			result.selfCPUTime = result.selfCPUTime + sensorValues.selfCPUTime as MicroSeconds_number
			result.aggregatedCPUTime = result.aggregatedCPUTime + sensorValues.aggregatedCPUTime as MicroSeconds_number
			result.internCPUTime = result.internCPUTime + sensorValues.internCPUTime as MicroSeconds_number
			result.externCPUTime = result.externCPUTime + sensorValues.externCPUTime as MicroSeconds_number
			result.langInternalCPUTime = result.langInternalCPUTime +
				sensorValues.langInternalCPUTime as MicroSeconds_number

			result.selfCPUEnergyConsumption =
				result.selfCPUEnergyConsumption + sensorValues.selfCPUEnergyConsumption as MilliJoule_number
			result.aggregatedCPUEnergyConsumption =
				result.aggregatedCPUEnergyConsumption + sensorValues.aggregatedCPUEnergyConsumption as MilliJoule_number
			result.internCPUEnergyConsumption =
				result.internCPUEnergyConsumption + sensorValues.internCPUEnergyConsumption as MilliJoule_number
			result.externCPUEnergyConsumption =
				result.externCPUEnergyConsumption + sensorValues.externCPUEnergyConsumption as MilliJoule_number
			result.langInternalCPUEnergyConsumption =
				result.langInternalCPUEnergyConsumption +
				sensorValues.langInternalCPUEnergyConsumption as MilliJoule_number

			result.selfRAMEnergyConsumption =
				result.selfRAMEnergyConsumption + sensorValues.selfRAMEnergyConsumption as MilliJoule_number
			result.aggregatedRAMEnergyConsumption =
				result.aggregatedRAMEnergyConsumption + sensorValues.aggregatedRAMEnergyConsumption as MilliJoule_number
			result.internRAMEnergyConsumption =
				result.internRAMEnergyConsumption + sensorValues.internRAMEnergyConsumption as MilliJoule_number
			result.externRAMEnergyConsumption =
				result.externRAMEnergyConsumption + sensorValues.externRAMEnergyConsumption as MilliJoule_number
			result.langInternalRAMEnergyConsumption =
				result.langInternalRAMEnergyConsumption +
				sensorValues.langInternalRAMEnergyConsumption as MilliJoule_number
		}
		return result
	}

	public static max(...args: SensorValues[]): SensorValues {
		const result = new SensorValues({})

		for (const sensorValues of args) {
			result.profilerHits = Math.max(
				result.profilerHits,
				sensorValues.profilerHits
			)

			result.selfCPUTime = Math.max(
				result.selfCPUTime,
				sensorValues.selfCPUTime
			) as MicroSeconds_number
			result.aggregatedCPUTime = Math.max(
				result.aggregatedCPUTime,
				sensorValues.aggregatedCPUTime
			) as MicroSeconds_number
			result.internCPUTime = Math.max(
				result.internCPUTime,
				sensorValues.internCPUTime
			) as MicroSeconds_number
			result.externCPUTime = Math.max(
				result.externCPUTime,
				sensorValues.externCPUTime
			) as MicroSeconds_number
			result.langInternalCPUTime = Math.max(
				result.langInternalCPUTime,
				sensorValues.langInternalCPUTime
			) as MicroSeconds_number

			result.selfCPUEnergyConsumption = Math.max(
				result.selfCPUEnergyConsumption,
				sensorValues.selfCPUEnergyConsumption
			) as MilliJoule_number
			result.aggregatedCPUEnergyConsumption = Math.max(
				result.aggregatedCPUEnergyConsumption,
				sensorValues.aggregatedCPUEnergyConsumption
			) as MilliJoule_number
			result.internCPUEnergyConsumption = Math.max(
				result.internCPUEnergyConsumption,
				sensorValues.internCPUEnergyConsumption
			) as MilliJoule_number
			result.externCPUEnergyConsumption = Math.max(
				result.externCPUEnergyConsumption,
				sensorValues.externCPUEnergyConsumption
			) as MilliJoule_number
			result.langInternalCPUEnergyConsumption = Math.max(
				result.langInternalCPUEnergyConsumption,
				sensorValues.langInternalCPUEnergyConsumption
			) as MilliJoule_number

			result.selfRAMEnergyConsumption = Math.max(
				result.selfRAMEnergyConsumption,
				sensorValues.selfRAMEnergyConsumption
			) as MilliJoule_number
			result.aggregatedRAMEnergyConsumption = Math.max(
				result.aggregatedRAMEnergyConsumption,
				sensorValues.aggregatedRAMEnergyConsumption
			) as MilliJoule_number
			result.internRAMEnergyConsumption = Math.max(
				result.internRAMEnergyConsumption,
				sensorValues.internRAMEnergyConsumption
			) as MilliJoule_number
			result.externRAMEnergyConsumption = Math.max(
				result.externRAMEnergyConsumption,
				sensorValues.externRAMEnergyConsumption
			) as MilliJoule_number
			result.langInternalRAMEnergyConsumption = Math.max(
				result.langInternalRAMEnergyConsumption,
				sensorValues.langInternalRAMEnergyConsumption
			) as MilliJoule_number
		}
		return result
	}

	public static equals(...args: SensorValues[]) {
		if (args.length === 0) {
			return true
		}
		const compare = args[0]

		for (let i = 1; i < args.length; i++) {
			const a = args[i]
			if (
				a.profilerHits !== compare.profilerHits ||

				a.selfCPUTime !== compare.selfCPUTime ||
				a.aggregatedCPUTime !== compare.aggregatedCPUTime ||
				a.internCPUTime !== compare.internCPUTime ||
				a.externCPUTime !== compare.externCPUTime ||
				a.langInternalCPUTime !== compare.langInternalCPUTime ||

				a.selfCPUEnergyConsumption !== compare.selfCPUEnergyConsumption ||
				a.aggregatedCPUEnergyConsumption !== compare.aggregatedCPUEnergyConsumption ||
				a.internCPUEnergyConsumption !== compare.internCPUEnergyConsumption ||
				a.externCPUEnergyConsumption !== compare.externCPUEnergyConsumption ||
				a.langInternalCPUEnergyConsumption !== compare.langInternalCPUEnergyConsumption ||

				a.selfRAMEnergyConsumption !== compare.selfRAMEnergyConsumption ||
				a.aggregatedRAMEnergyConsumption !== compare.aggregatedRAMEnergyConsumption ||
				a.internRAMEnergyConsumption !== compare.internRAMEnergyConsumption ||
				a.externRAMEnergyConsumption !== compare.externRAMEnergyConsumption ||
				a.langInternalRAMEnergyConsumption !== compare.langInternalRAMEnergyConsumption
			) {
				return false
			}
		}
		return true
	}

	private undefinedIfZero(value: number) {
		if (value === 0) {
			return undefined
		}
		return value
	}

	toJSON(): ISensorValues {
		return {
			profilerHits: this.undefinedIfZero(this.profilerHits),

			selfCPUTime: this.undefinedIfZero(this.selfCPUTime) as MicroSeconds_number,
			aggregatedCPUTime: this.undefinedIfZero(this.aggregatedCPUTime) as MicroSeconds_number,
			internCPUTime: this.undefinedIfZero(this.internCPUTime) as MicroSeconds_number,
			externCPUTime: this.undefinedIfZero(this.externCPUTime) as MicroSeconds_number,
			langInternalCPUTime: this.undefinedIfZero(this.langInternalCPUTime) as MicroSeconds_number,

			selfCPUEnergyConsumption: this.undefinedIfZero(this.selfCPUEnergyConsumption) as MilliJoule_number,
			aggregatedCPUEnergyConsumption:
				this.undefinedIfZero(this.aggregatedCPUEnergyConsumption) as MilliJoule_number,
			internCPUEnergyConsumption: this.undefinedIfZero(this.internCPUEnergyConsumption) as MilliJoule_number,
			externCPUEnergyConsumption: this.undefinedIfZero(this.externCPUEnergyConsumption) as MilliJoule_number,
			langInternalCPUEnergyConsumption:
				this.undefinedIfZero(this.langInternalCPUEnergyConsumption) as MilliJoule_number,

			selfRAMEnergyConsumption: this.undefinedIfZero(this.selfRAMEnergyConsumption) as MilliJoule_number,
			aggregatedRAMEnergyConsumption:
				this.undefinedIfZero(this.aggregatedRAMEnergyConsumption) as MilliJoule_number,
			internRAMEnergyConsumption: this.undefinedIfZero(this.internRAMEnergyConsumption) as MilliJoule_number,
			externRAMEnergyConsumption: this.undefinedIfZero(this.externRAMEnergyConsumption) as MilliJoule_number,
			langInternalRAMEnergyConsumption:
				this.undefinedIfZero(this.langInternalRAMEnergyConsumption) as MilliJoule_number,
		}
	}

	static fromJSON(json: string | ISensorValues): SensorValues {
		let data: ISensorValues
		if (typeof json === 'string') {
			data = JSON.parse(json)
		} else {
			data = json
		}
		const result = new SensorValues(
			{
				profilerHits: data.profilerHits || 0,

				selfCPUTime: data.selfCPUTime || 0 as MicroSeconds_number,
				aggregatedCPUTime: data.aggregatedCPUTime || 0 as MicroSeconds_number,
				internCPUTime: data.internCPUTime || 0 as MicroSeconds_number,
				externCPUTime: data.externCPUTime || 0 as MicroSeconds_number,
				langInternalCPUTime: data.langInternalCPUTime || 0 as MicroSeconds_number,

				selfCPUEnergyConsumption: data.selfCPUEnergyConsumption || 0 as MilliJoule_number,
				aggregatedCPUEnergyConsumption: data.aggregatedCPUEnergyConsumption || 0 as MilliJoule_number,
				internCPUEnergyConsumption: data.internCPUEnergyConsumption || 0 as MilliJoule_number,
				externCPUEnergyConsumption: data.externCPUEnergyConsumption || 0 as MilliJoule_number,
				langInternalCPUEnergyConsumption: data.langInternalCPUEnergyConsumption || 0 as MilliJoule_number,

				selfRAMEnergyConsumption: data.selfRAMEnergyConsumption || 0 as MilliJoule_number,
				aggregatedRAMEnergyConsumption: data.aggregatedRAMEnergyConsumption || 0 as MilliJoule_number,
				internRAMEnergyConsumption: data.internRAMEnergyConsumption || 0 as MilliJoule_number,
				externRAMEnergyConsumption: data.externRAMEnergyConsumption || 0 as MilliJoule_number,
				langInternalRAMEnergyConsumption: data.langInternalRAMEnergyConsumption || 0 as MilliJoule_number
			})
		return result
	}

	toBuffer(): Buffer {
		return BufferHelper.numberMapToBuffer(
			SENSOR_VALUES_BYTE_SIZE_MAP as Record<string, PrimitiveBufferTypes.UInt | PrimitiveBufferTypes.Double>,
			this
		)
	}

	static consumeFromBuffer(buffer: Buffer):{
		instance: SensorValues,
		remainingBuffer: Buffer
	} {
		const { instance, remainingBuffer } = BufferHelper.numberMapFromBuffer(
			SENSOR_VALUES_BYTE_SIZE_MAP as Record<string, PrimitiveBufferTypes.UInt | PrimitiveBufferTypes.Double>,
			buffer
		)

		return {
			instance: new SensorValues(instance),
			remainingBuffer
		}
	}

	add({
		internSensorValues,
		externSensorValues,
		langInternalSensorValues,
	}: {
		internSensorValues?: SensorValues,
		externSensorValues?: SensorValues,
		langInternalSensorValues?: SensorValues,
	}) {
		const result = SensorValues.fromJSON(this.toJSON())

		if (internSensorValues) {
			result.aggregatedCPUTime = result.aggregatedCPUTime +
				internSensorValues.aggregatedCPUTime as MicroSeconds_number
			result.aggregatedCPUEnergyConsumption = result.aggregatedCPUEnergyConsumption +
				internSensorValues.aggregatedCPUEnergyConsumption as MilliJoule_number
			result.aggregatedRAMEnergyConsumption = result.aggregatedRAMEnergyConsumption + 
				internSensorValues.aggregatedRAMEnergyConsumption as MilliJoule_number

			result.internCPUTime = result.internCPUTime +
				internSensorValues.aggregatedCPUTime as MicroSeconds_number
			result.internCPUEnergyConsumption = result.internCPUEnergyConsumption +
				internSensorValues.aggregatedCPUEnergyConsumption as MilliJoule_number
			result.internRAMEnergyConsumption = result.internRAMEnergyConsumption +
				internSensorValues.aggregatedRAMEnergyConsumption as MilliJoule_number
		}
		if (externSensorValues) {
			result.aggregatedCPUTime = result.aggregatedCPUTime +
				externSensorValues.aggregatedCPUTime as MicroSeconds_number
			result.aggregatedCPUEnergyConsumption = result.aggregatedCPUEnergyConsumption +
				externSensorValues.aggregatedCPUEnergyConsumption as MilliJoule_number
			result.aggregatedRAMEnergyConsumption = result.aggregatedRAMEnergyConsumption +
				externSensorValues.aggregatedRAMEnergyConsumption as MilliJoule_number

			result.externCPUTime = result.externCPUTime +
				externSensorValues.aggregatedCPUTime as MicroSeconds_number
			result.externCPUEnergyConsumption = result.externCPUEnergyConsumption +
				externSensorValues.aggregatedCPUEnergyConsumption as MilliJoule_number
			result.externRAMEnergyConsumption = result.externRAMEnergyConsumption +
				externSensorValues.aggregatedRAMEnergyConsumption as MilliJoule_number
		}
		if (langInternalSensorValues) {
			result.aggregatedCPUTime = result.aggregatedCPUTime +
				langInternalSensorValues.aggregatedCPUTime as MicroSeconds_number
			result.aggregatedCPUEnergyConsumption = result.aggregatedCPUEnergyConsumption +
				langInternalSensorValues.aggregatedCPUEnergyConsumption as MilliJoule_number
			result.aggregatedRAMEnergyConsumption = result.aggregatedRAMEnergyConsumption +
				langInternalSensorValues.aggregatedRAMEnergyConsumption as MilliJoule_number

			result.langInternalCPUTime = result.langInternalCPUTime +
				langInternalSensorValues.aggregatedCPUTime as MicroSeconds_number
			result.langInternalCPUEnergyConsumption = result.langInternalCPUEnergyConsumption +
				langInternalSensorValues.aggregatedCPUEnergyConsumption as MilliJoule_number
			result.langInternalRAMEnergyConsumption = result.langInternalRAMEnergyConsumption +
				langInternalSensorValues.aggregatedRAMEnergyConsumption as MilliJoule_number
		}
		return result
	}
}