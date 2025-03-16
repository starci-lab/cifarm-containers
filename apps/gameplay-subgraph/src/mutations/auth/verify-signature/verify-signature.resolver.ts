import { Logger } from "@nestjs/common"
import { VerifySignatureService } from "./verify-signature.service"
import { VerifySignatureRequest, VerifySignatureResponse } from "./verify-signature.dto"
import { Resolver, Mutation, Args } from "@nestjs/graphql"

@Resolver()
export class VerifySignatureResolver {
    private readonly logger = new Logger(VerifySignatureResolver.name)

    constructor(private readonly verifySignatureService: VerifySignatureService) {}

    @Mutation(() => VerifySignatureResponse, { name: "verifySignature", description: "Verify a signature" })
    public async verifySignature(@Args("request") request: VerifySignatureRequest) {
        return this.verifySignatureService.verifySignature(request)
    }
}
