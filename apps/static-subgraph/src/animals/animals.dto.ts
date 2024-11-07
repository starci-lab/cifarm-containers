import { Field, InputType, Int } from "@nestjs/graphql"

@InputType()
export class GetAnimalsArgs {
    @Field(() => Int, { nullable: true }) //default 10
        limit?: number
    @Field(() => Int, { nullable: true }) //default 0
        offset?: number
}