import { Logger } from "@nestjs/common"
import { GenerateSignatureRequest, GenerateSignatureResponse } from "./generate-signature.dto"
import { GenerateSignatureService } from "./generate-signature.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"

@Resolver()
export class GenerateSignatureResolver {
    private readonly logger = new Logger(GenerateSignatureResolver.name)

    constructor(private readonly generateSignatureService: GenerateSignatureService) {}

    @Mutation(() => GenerateSignatureResponse, {
        name: "generateSignature",
        description: "Generate a signature"
    })
    public async generateSignature(@Args("request") request: GenerateSignatureRequest) {
        return this.generateSignatureService.generateSignature(request)
    }
}
