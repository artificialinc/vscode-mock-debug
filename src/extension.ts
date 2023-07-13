/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *---------------------------------------------------------
 * Copyright (C) Artificial, Inc. All rights reserved.
 *---------------------------------------------------------
 * extension.ts (and activateWorkflowDebug.ts) forms the "plugin" that plugs into VS Code and contains the code that
 * connects VS Code with the debug adapter.
 * 
 * Since the code in extension.ts uses node.js APIs it cannot run in the browser.
 */

'use strict';

import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { activateWorkflowDebug } from './activateWorkflowDebug';


export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('Artificial Workflow Debugging')
	context.subscriptions.push(outputChannel)
	activateWorkflowDebug(context, new WorkflowDebugAdapterFactory(outputChannel));
}

export function deactivate() {
	// nothing to do
}

class WorkflowDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

	private _outputChannel: vscode.OutputChannel;

	constructor(outputChannel: vscode.OutputChannel) {
		this._outputChannel = outputChannel
	}

	createDebugAdapterDescriptor(_session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): ProviderResult<vscode.DebugAdapterDescriptor> {
		// param "executable" contains the executable optionally specified in the package.json (if any)

		const debugConfig = vscode.workspace.getConfiguration('artificial.workflow.debug')

		const port: number | null = debugConfig.debugAdapterPort;
		if (port) {
			this._outputChannel.appendLine(`Connecting to debug adapter on port ${port}`)
			return new vscode.DebugAdapterServer(port);
		}

		const command = "wfdebug";
		const debugLog: boolean = debugConfig.debugLog;
		var args: Array<string> = [];
		if (debugLog) {
			args = args.concat('--debuglog')
		}
		const options = {};
		this._outputChannel.appendLine(`Starting debug adapter ${command} with args ${args}`)
		return new vscode.DebugAdapterExecutable(command, args, options);
	}

	dispose() { }
}
