import { Module } from "@nestjs/common"
import { UpdateTutorialModule } from "./update-tutorial"

@Module({
    imports: [UpdateTutorialModule]
})
export class ProfileModule {}
