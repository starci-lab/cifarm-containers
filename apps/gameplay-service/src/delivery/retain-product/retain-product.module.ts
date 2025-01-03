import { Global, Module } from "@nestjs/common"
import { RetainProductService } from "./retain-product.service"
import { RetainProductController } from "./retain-product.controller"
import { GameplayPostgreSQLModule } from "@src/databases"
import { GameplayModule } from "@src/gameplay"


@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    providers: [RetainProductService],
    exports: [RetainProductService],
    controllers: [RetainProductController]
})
export class RetainProductModule {}
