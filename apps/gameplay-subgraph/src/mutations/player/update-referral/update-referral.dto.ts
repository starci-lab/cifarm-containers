import { ApiProperty } from "@nestjs/swagger"
import { UserIdRequest } from "@src/common"
import { IsMongoId } from "class-validator"

export class UpdateReferralRequest extends UserIdRequest {
    @IsMongoId()
    @ApiProperty({ example: "60f2b4f3e0c6b8f6c1c4b7d0" })
        referralUserId: string
}

export class UpdateReferralResponse {
    // this class is intentionally left blank
}