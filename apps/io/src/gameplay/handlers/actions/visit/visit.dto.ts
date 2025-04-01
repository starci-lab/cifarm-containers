import { IsMongoId } from "class-validator"

export class VisitMessage {
    @IsMongoId()
        neighborUserId: string
}