import { Global, Module } from "@nestjs/common"
import { TheifService } from "./theif.service"

@Global()
@Module({
    imports: [],
    providers: [TheifService],
    exports: [TheifService]
})
export class TheifModule {}
