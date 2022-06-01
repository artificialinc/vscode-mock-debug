# Artificial Workflow Debug Extension

This extension enables the 'artificial-workflow' debug type for debugging the execution of Artificial, inc. Workflows defined with Orchestration Python. It supports launching workflows for debugging, *step*, *continue*, *breakpoints*, *runtime errors*, and *local variable inspection*. Attaching to running workflows is not yet supported.

This extension is intended to be used with the VSCode devcontainer released as part of the Artificial SDK; in particular, it depends on the external CLI `wfdebug` tool, published in a separate Python package included in that devcontainer.

Note: this project was forked from [microsoft/vscode-mock-debug](https://github.com/microsoft/vscode-mock-debug); the original README can be found [here](https://github.com/microsoft/vscode-mock-debug/blob/main/readme.md).

# Using Workflow Debugging

Ensure that your devcontainer has the following environment variables globally exported, and that they point to the Artificial lab environment where you want to run workflows:

* ARTIFICIAL_HOST
* ARTIFICIAL_ORGID
* ARTIFICIAL_LABID
* ARTIFICIAL_TOKEN
* ARTIFICIAL_CERT
* ARTIFICIAL_KEY

You should be able to open a terminal in your devcontainer and use e.g. `echo $ARTIFICIAL_TOKEN` to ensure that the above are visible to `wfdebug`.

To launch a workflow for debugging, create a launch.json configuration that looks similar to:

```
		{
			"type": "artificial-workflow",
			"request": "launch",
			"name": "Debug Current File",
			"program": "${file}"
		}
```

When you launch, ensure that `"program"` contains the path to your workflow Python file.

Currently, only Python files containing a single `@workflow` function are supported.

To break on workflow runtime errors, check the "Runtime Errors" box that appears under Breakpoints after the first time you launch.

To include workflow parameter values when launching, add the `"jobArgs"` parameter to your launch configuration:

```
        {
            // ...
            "jobArgs": {
                "parameter name": /* JSON parameter value */
            }
        }
```
