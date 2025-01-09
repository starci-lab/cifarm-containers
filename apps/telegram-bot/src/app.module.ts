import { Module } from "@nestjs/common"
import { CiFarmModule } from "./cifarm"

@Module({
    imports: [
        CiFarmModule.forRoot(),
    ],
})
export class AppModule {}
