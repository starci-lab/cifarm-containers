import { Injectable, Logger } from "@nestjs/common"
import { exec as nodeExec, execSync as nodeExecSync } from "child_process"
import os from "os"

@Injectable()
export class ExecService {
    private logger = new Logger(ExecService.name)
    private shell: "powershell.exe" | "/bin/bash"
    constructor() {
        const platform = os.platform()
        this.shell = platform === "win32" ? "powershell.exe" : "/bin/bash"
    }
    public async exec(command: string): Promise<string> {
        this.logger.debug(`Executing command: ${command}`)
        return new Promise((resolve, reject) => {
            nodeExec(
                command,
                {
                    shell: this.shell,
                },
                (error, stdout, stderr) => {
                    if (error) {
                        this.logger.error(`Error: ${stderr || error.message}`)
                        reject(`Error: ${stderr || error.message}`)
                    }
                    resolve(stdout)
                }
            )
        })
    }

    public execSync(command: string): string {
        this.logger.debug(`Executing command: ${command}`)
        return nodeExecSync(command, {
            encoding: "utf8",
            shell: this.shell
        })
    }
}
