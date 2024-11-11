import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BuyAnimalService } from "./buy-animal.service"
import { UserEntity } from "@src/database"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]) 
    ],
    providers: [BuyAnimalService],
    exports: [BuyAnimalService],
})
export class BuyAnimalModule {}
