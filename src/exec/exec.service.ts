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
        return new Promise((resolve, reject) => {
            nodeExec(
                command,
                {
                    shell: this.shell
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
        return nodeExecSync(command, {
            encoding: "base64",
            shell: this.shell
        })
    }
}
