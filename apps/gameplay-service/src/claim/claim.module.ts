import { Module } from "@nestjs/common"
import { SpinModule } from "./spin"

@Module({
    imports: [SpinModule]
})
export class ClaimModule {}
