/*
 * extension.ts (and activateWorkflowDebug.ts) forms the "plugin" that plugs into VS Code and contains the code that
 * connects VS Code with the debug adapter.
 * 
 * Since the code in extension.ts uses node.js APIs it cannot run in the browser.
 */

'use strict';

import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { activateMockDebug } from './activateWorkflowDebug';

/*
 * The compile time flag 'runMode' controls how the debug adapter is run.
 * Please note: the test suite only supports 'external' mode.
 */
const runMode: 'external' | 'server' = 'external';

export function activate(context: vscode.ExtensionContext) {

	// debug adapters can be run in different ways by using a vscode.DebugAdapterDescriptorFactory:
	switch (runMode) {
		case 'server':
			// communicate with a running debug adapter process via a socket
			activateMockDebug(context, new WorkflowDebugAdapterServerDescriptorFactory());
			break;

		case 'external': default:
			// run the debug adapter as a separate process
			activateMockDebug(context, new WorkflowDebugAdapterExecutableFactory());
			break;
	}
}

export function deactivate() {
	// nothing to do
}

class WorkflowDebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {

	createDebugAdapterDescriptor(_session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): ProviderResult<vscode.DebugAdapterDescriptor> {
		// param "executable" contains the executable optionally specified in the package.json (if any)

		const command = "wfdebug";
		const args = [];
		const options = {};
		return new vscode.DebugAdapterExecutable(command, args, options);
	}
}

class WorkflowDebugAdapterServerDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

	createDebugAdapterDescriptor(session: vscode.DebugSession, executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
		return new vscode.DebugAdapterServer(4711);
	}

	dispose() { }
}
