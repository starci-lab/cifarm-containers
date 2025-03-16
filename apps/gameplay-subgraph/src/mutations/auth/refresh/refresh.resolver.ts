import { Logger } from "@nestjs/common"
import { RefreshService } from "./refresh.service"
import { RefreshRequest, RefreshResponse } from "./refresh.dto"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
    
@Resolver()
export class RefreshResolver {
    private readonly logger = new Logger(RefreshResolver.name)

    constructor(private readonly refreshService: RefreshService) {}

    @Mutation(() => RefreshResponse, { name: "refresh" })
    public async refresh(@Args("request") request: RefreshRequest) {
        return this.refreshService.refresh(request)
    }
}
