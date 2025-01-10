import { Inject, Injectable, Logger } from "@nestjs/common"
import { exec as nodeExec, execSync as nodeExecSync } from "child_process"
import os from "os"
import { MODULE_OPTIONS_TOKEN } from "./exec.module-definition"
import { ExecOptions } from "./exec.types"

@Injectable()
export class ExecService {
    private readonly logger = new Logger(ExecService.name)
    private readonly shell: "powershell.exe" | "/bin/bash"

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: ExecOptions
    ) {
        const platform = os.platform()
        this.shell = platform === "win32" ? "powershell.exe" : "/bin/bash"
    }
    public async exec(command: string): Promise<string> {
        // Log the command if debug is enabled
        this.logger.debug(`Executing command: ${command}`)
        
        return new Promise((resolve, reject) => {
            nodeExec(
                command,
                {
                    shell: this.shell,
                },
                (error, stdout, stderr) => {
                    if (error) {
                        const errorMessage = `Error: ${stderr || error.message}`
                        this.logger.error(errorMessage)
                        reject(new Error(errorMessage))
                    }
                    resolve(stdout)
                }
            )
        })
    }

    public execSync(command: string): string {
        // Log the command if debug is enabled
        this.logger.debug(`Executing command: ${command}`)
        
        return nodeExecSync(command, {
            encoding: "utf8",
            shell: this.shell
        })
    }
}
