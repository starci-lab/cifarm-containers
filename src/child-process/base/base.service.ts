import { Injectable, Logger } from "@nestjs/common"
import { exec } from "child_process"
import os from "os"

@Injectable()
export class ChildProcessService {
    private logger = new Logger(ChildProcessService.name)
    private platform: NodeJS.Platform
    constructor() {
        this.platform = os.platform()
    }

    // Execute a command based on the current OS (PowerShell for Windows, sh/bash for Linux/macOS)
    public async execAsync(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, {
                shell: this.platform === "win32" ? "powershell.exe" : "/bin/bash"
            }, (error, stdout, stderr) => {
                if (error) {
                    this.logger.error(`Error: ${stderr || error.message}`)
                    reject(`Error: ${stderr || error.message}`)
                }
                resolve(stdout)
            })
        })
    }
}