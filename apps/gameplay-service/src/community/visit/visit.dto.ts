import { UserIdRequest } from "@src/common"
import { IsBoolean, IsUUID } from "class-validator"

export class VisitRequest extends UserIdRequest {
    @IsUUID("4")
        visitingUserId: string

    @IsBoolean()
        isRandom: boolean
}

export class VisitResponse {}