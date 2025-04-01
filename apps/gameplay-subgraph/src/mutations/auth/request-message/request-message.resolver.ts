import { Logger, UseGuards } from "@nestjs/common"
import { RequestMessageService } from "./request-message.service"
import { RequestMessageResponse } from "./request-message.dto"
import { Resolver, Mutation } from "@nestjs/graphql"
import { GraphQLThrottlerGuard, ThrottlerName, UseThrottlerName } from "@src/throttler"

@Resolver()
export class RequestMessageResolver {
    private readonly logger = new Logger(RequestMessageResolver.name)

    constructor(private readonly requestMessageService: RequestMessageService) {}

    @UseThrottlerName(ThrottlerName.Tiny)
    @UseGuards(GraphQLThrottlerGuard)
    @Mutation(() => RequestMessageResponse, {
        name: "requestMessage",
        description: "Request a message to sign"
    })
    public async requestMessage() {
        return this.requestMessageService.requestMessage()
    }
}
