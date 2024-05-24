import * as ts from 'typescript'

import { SourceNodeIdentifier_string } from '../types/SourceNodeIdentifiers.types'

export enum EmitHelperNames {
	// TypeScript Helpers
	decorate = '__decorate',
	metadata = '__metadata',
	param = '__param',
	// ES Decorators Helpers
	esDecorate = '__esDecorate',
	runInitializers = '__runInitializers',
	// ES2018 Helpers
	assign = '__assign',
	await = '__await',
	asyncGenerator = '__asyncGenerator',
	asyncDelegator = '__asyncDelegator',
	asyncValues = '__asyncValues',
	// ES2018 Destructuring Helpers
	rest = '__rest',
	// ES2017 Helpers
	awaiter = '__awaiter',
	// ES2015 Helpers
	extends = '__extends',
	makeTemplateObject = '__makeTemplateObject',
	read = '__read',
	spreadArray = '__spreadArray',
	propKey = '__propKey',
	setFunctionName = '__setFunctionName',
	// ES2015 Destructuring Helpers
	values = '__values'
}

export const EmitHelperNameStrings = Object.values(EmitHelperNames)

export class TypeScriptHelper {
	static isUseStrict(node: ts.Node) {
		if (ts.isStringLiteral(node)) {
			if (node.text === 'use strict') {
				return true
			}
		}
		return false
	}

	static getEmitHelperName(node: ts.FunctionExpression): EmitHelperNames | undefined {
		const varDeclaration = node?.parent?.parent

		if (varDeclaration !== undefined && ts.isVariableDeclaration(varDeclaration)) {
			if (ts.isIdentifier(varDeclaration.name)) {
				if (EmitHelperNameStrings.includes(varDeclaration.name.text as EmitHelperNames)) {
					return varDeclaration.name.text as EmitHelperNames
				}
			}
		}

		const varDeclarationExtends = node?.parent?.parent?.parent?.parent
		if (varDeclarationExtends !== undefined && ts.isVariableDeclaration(varDeclarationExtends)) {
			if (ts.isIdentifier(varDeclarationExtends.name)) {
				if (varDeclarationExtends.name.text === EmitHelperNames.extends) {
					return EmitHelperNames.extends
				}
			}
		}
		return undefined
	}

	static awaiterSourceNodeIdentifier(): SourceNodeIdentifier_string {
		return '{root}.{functionExpression:__awaiter}' as SourceNodeIdentifier_string
	}
}