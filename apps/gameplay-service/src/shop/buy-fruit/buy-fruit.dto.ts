import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { FruitId } from "@src/databases"
import { Position } from "@src/gameplay"
import { Type } from "class-transformer"
import { ValidateNested } from "class-validator"

export class BuyFruitRequest extends UserIdRequest {
    @ValidateNested()
    @Type(() => Position)
    @ApiProperty({ type: Position })
        position: Position
    
    @ApiProperty({
        example: FruitId.Apple,
    })
        fruitId: FruitId
}

export class BuyFruitResponse {
    // This class is intentionally left empty for future extensions
}
