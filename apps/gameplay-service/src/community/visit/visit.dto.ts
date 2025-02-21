import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsMongoId, IsOptional } from "class-validator"

export class VisitRequest extends UserIdRequest {
    // if neighborUserId is not provided, it will randomly select a user to visit
    @IsOptional()
    @IsMongoId()
    @ApiProperty({ example: "60f1b3b3b3b3b3b3b3b3b3b3", nullable: true })
        neighborUserId?: string
}

export class VisitResponse {
    @IsMongoId()
    @ApiProperty({ example: "60f1b3b3b3b3b3b3b3b3b3b3" })
        neighborUserId: string
}