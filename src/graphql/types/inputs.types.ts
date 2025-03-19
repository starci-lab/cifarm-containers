import { InputType, Field, Int, ID, ObjectType } from "@nestjs/graphql"
import { IsInt, IsOptional, Min } from "class-validator"

@InputType({
    isAbstract: true
})
export abstract class IdArgs {
    @Field(() => ID)
        id: string
}

@InputType({
    isAbstract: true,
    description: "Paginated request"
})
export abstract class PaginatedRequest {
    @IsInt()
    @IsOptional()
    @Field(() => Int, { defaultValue: 10, description: "Limit of items to return" })
        limit: number
    @IsInt()
    @IsOptional()
    @Field(() => Int, { defaultValue: 0, description: "Offset of items to return" })
        offset: number
}

@ObjectType({
    isAbstract: true,
    description: "Paginated response"
})
export abstract class PaginatedResponse {
    @IsInt()
    @Min(0)
    @Field(() => Int, { description: "Total number of items" })
        count: number
}

export interface IPaginatedResponse<TSchema> {
    count: number
    data: Array<TSchema>
}