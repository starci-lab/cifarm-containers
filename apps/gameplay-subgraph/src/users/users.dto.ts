import { Field, Float, ID, InputType, Int } from "@nestjs/graphql"
import { PaginatedArgs } from "@src/common/types"
import { Network, SupportedChainKey } from "@src/grpc"

@InputType({
    description: "GetUsersArgs"
})
export class GetUsersArgs extends PaginatedArgs {
    @Field(() => ID, { nullable: true })
        id: string

    @Field(() => String, { nullable: true })
        username: string

    @Field(() => String, { nullable: true })
        chainKey: SupportedChainKey

    @Field(() => String, { nullable: true })
        network: Network

    @Field(() => String, { nullable: true })
        accountAddress: string

    @Field(() => Int, { nullable: true })
        golds: number

    @Field(() => Float, { nullable: true })
        tokens: number

    @Field(() => Int, { nullable: true })
        experiences: number

    @Field(() => Int, { nullable: true })
        energy: number

    @Field(() => Int, { nullable: true })
        level: number

    @Field(() => Int, { nullable: true })
        tutorialIndex: number

    @Field(() => Int, { nullable: true })
        stepIndex: number

    @Field(() => Int, { nullable: true })
        dailyRewardStreak: number

    @Field(() => Date, { nullable: true })
        dailyRewardLastClaimTime?: Date

    @Field(() => Int, { nullable: true })
        dailyRewardNumberOfClaim: number

    @Field(() => Date, { nullable: true })
        spinLastTime?: Date

    @Field(() => Int, { nullable: true })
        spinCount: number

    @Field(() => ID, { nullable: true })
        visitingUserId?: string

    @Field({ nullable: true })
        isRandom?: boolean
}
