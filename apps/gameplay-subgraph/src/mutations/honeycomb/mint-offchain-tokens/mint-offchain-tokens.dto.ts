import { IsInt, IsPositive } from "class-validator"
import { InputType, Field } from "@nestjs/graphql"

@InputType()
export class MintOffchainTokensRequest{
    @IsInt()
    @IsPositive()
    @Field(() => Number, { description: "The amount of tokens to mint" })
        amount: number
}