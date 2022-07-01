/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *---------------------------------------------------------
 * Copyright (C) Artificial, Inc. All rights reserved.
 *---------------------------------------------------------
 * activateWorkflowDebug.ts containes the shared extension code that can be executed both in node.js and the browser.
 */

'use strict';

import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';

export function activateWorkflowDebug(context: vscode.ExtensionContext, factory: vscode.DebugAdapterDescriptorFactory) {

	// register a configuration provider for 'artificial-workflow' debug type
	const provider = new ArtificialWorkflowDebugConfigurationProvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('artificial-workflow', provider));

	// register a dynamic configuration provider for 'artificial-workflow' debug type
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('artificial-workflow', {
		provideDebugConfigurations(folder: WorkspaceFolder | undefined): ProviderResult<DebugConfiguration[]> {
			return [
				{
					name: "Dynamic Launch",
					request: "launch",
					type: "artificial-workflow",
					program: "${file}"
				}
			];
		}
	}, vscode.DebugConfigurationProviderTriggerKind.Dynamic));

	context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('artificial-workflow', factory));

	vscode.window.registerUriHandler({
		handleUri
	});
}

class ArtificialWorkflowDebugConfigurationProvider implements vscode.DebugConfigurationProvider {

	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
	async resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): Promise<DebugConfiguration | undefined> {

		// if launch.json is missing or empty
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'python') {
				config.type = 'artificial-workflow';
				config.name = 'Launch';
				config.request = 'launch';
				config.program = '${file}';
			}
		}

		if (!config.program) {
			await vscode.window.showErrorMessage("Cannot find a program to debug");
			return undefined;	// abort launch
		}

		if (config.type == 'attach' && !config.jobId && !config.jobName) {
			await vscode.window.showErrorMessage("jobId or jobName must be specified in attach config");
			return undefined;
		}

		config.envFile = config.envFile ?? vscode.workspace.getConfiguration('artificial.workflow.debug').envFilePath

		try {
			await vscode.workspace.fs.stat(vscode.Uri.parse('file:///home/code/.local/bin/wfdebug'));
		}
		catch (ex: any) {
			const fileSystemError: vscode.FileSystemError = ex;
			vscode.window.showWarningMessage(`Cannot access wfdebug utility; please ensure that the artificial-debug-adapter package is installed. Error: ${fileSystemError.message}`);
		}
		return config;
	}
}

function handleUri(uri: vscode.Uri) {
	const queryParams = parseQueryString(uri.query)
	if (uri.path == '/attachJob' || uri.path == '/launchJob') {
		const configuration = {
			type: 'artificial-workflow',
			name: uri.path == '/attachJob' ? 'Attach To Job' : 'Launch Job',
			request: uri.path == '/attachJob' ? 'attach' : 'launch',
			program: '${file}',
			jobId: queryParams['jobId']
		};
		vscode.debug.startDebugging(undefined, configuration);
	}
}

function parseQueryString(query: string) {
	let params = {}
	for (const param of query.split('&').map(s => {
		let components = s.split('=')
		return { name: components[0], value: components[1] }
	})) {
		const { name, value } = param;
		params[name] = value;
	}
	return params;
}
