import { Global, Module } from "@nestjs/common"
import { ThiefService } from "./thief.service"

@Global()
@Module({
    imports: [],
    providers: [ThiefService],
    exports: [ThiefService]
})
export class ThiefModule {}
