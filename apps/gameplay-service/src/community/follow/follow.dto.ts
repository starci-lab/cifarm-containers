import { UserIdRequest } from "@src/common"
import { IsUUID } from "class-validator"

export class FollowRequest extends UserIdRequest {
    @IsUUID("4")
        followedUserId: string
}

export class FollowResponse {
    // Empty
}