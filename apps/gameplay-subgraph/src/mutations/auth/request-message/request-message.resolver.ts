import { Logger } from "@nestjs/common"
import { RequestMessageService } from "./request-message.service"
import { RequestMessageResponse } from "./request-message.dto"
import { Resolver, Mutation } from "@nestjs/graphql"
  
@Resolver()
export class RequestMessageResolver {
    private readonly logger = new Logger(RequestMessageResolver.name)

    constructor(private readonly requestMessageService: RequestMessageService) {}

    @Mutation(() => RequestMessageResponse, { name: "requestMessage" })
    public async requestMessage() {
        return this.requestMessageService.requestMessage()
    }
}
