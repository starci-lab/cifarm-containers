import { InputType, Field, Int, ID, ObjectType } from "@nestjs/graphql"

@InputType({
    isAbstract: true
})
export abstract class IdArgs {
    @Field(() => ID)
        id: string
}

@InputType({
    isAbstract: true
})
export abstract class PaginatedRequest {
    @Field(() => Int, { nullable: true, defaultValue: 10 }) //default 10
        limit?: number = 10
    @Field(() => Int, { nullable: true, defaultValue: 0 }) //default 0
        offset?: number = 0
}

@ObjectType({
    isAbstract: true
})
export abstract class PaginatedResponse {
    @Field(() => Int)
        count: number
}

export interface IPaginatedResponse<TEntity> {
    count: number
    data: Array<TEntity>
}