import { IsMongoId, IsOptional } from "class-validator"
import { ObjectType, InputType, Field } from "@nestjs/graphql"        

@InputType()
export class VisitRequest {
    // if neighborUserId is not provided, it will randomly select a user to visit
    @IsOptional()
    @IsMongoId()
    @Field(() => String, { nullable: true, description: "The ID of the user to visit" })
        neighborUserId?: string
}

@ObjectType()
export class VisitResponse {
    @IsMongoId()
    @Field(() => String, { description: "The ID of the user to visit" })
        neighborUserId: string
}