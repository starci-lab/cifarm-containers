import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsMongoId } from "class-validator"

export class FollowRequest extends UserIdRequest {
    @IsMongoId()
    @ApiProperty({ example: "60f1b3b3b3b3b3b3b3b3b3b3" })
        followeeUserId: string
}

export class FollowResponse {
}