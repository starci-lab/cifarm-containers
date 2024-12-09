import { UserIdRequest } from "@src/types"
import { IsUUID } from "class-validator"

export class UnfollowRequest extends UserIdRequest {
    @IsUUID("4")
        unfollowedUserId: string
}
