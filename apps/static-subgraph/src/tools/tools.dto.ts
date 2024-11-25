import { Field, InputType, Int } from "@nestjs/graphql"

@InputType()
export class GetToolsArgs {
    @Field(() => Int, { nullable: true, defaultValue: 10 }) //default 10
        limit?: number
    @Field(() => Int, { nullable: true, defaultValue: 0 }) //default 0
        offset?: number
}
