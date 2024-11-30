import { UserIdRequest } from "@src/types"
import { IsUUID } from "class-validator"

export class FollowRequest extends UserIdRequest {
    @IsUUID("4")
        followedUserId: string
}
