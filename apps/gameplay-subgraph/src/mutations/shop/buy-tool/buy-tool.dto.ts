import { ToolId } from "@src/databases"
import { IsString } from "class-validator"
import { Field, InputType } from "@nestjs/graphql"

@InputType()
export class BuyToolRequest  {
    @IsString()
    @Field(() => String, { description: "The ID of the tool to buy" })
        toolId: ToolId
}
