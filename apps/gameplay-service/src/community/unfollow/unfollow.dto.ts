import { UserIdRequest } from "@src/common"
import { IsUUID } from "class-validator"

export class UnfollowRequest extends UserIdRequest {
    @IsUUID("4")
        unfollowedUserId: string
}

export class UnfollowResponse {
    // This class is intentionally left empty for future extensions
}