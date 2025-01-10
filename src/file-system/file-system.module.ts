import { Module } from "@nestjs/common"
import { FileSystemService } from "./file-system.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./file-system.module-definition"

@Module({
    providers: [FileSystemService],
    exports: [FileSystemService]
})
export class FileSystemModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
