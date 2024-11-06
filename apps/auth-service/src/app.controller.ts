import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { authGrpcConstants } from "./constant"
import {
    GenerateFakeSignatureRequest,
    GenerateFakeSignatureService,
} from "./generate-fake-signature"
import { RequestMessageService } from "./request-message"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
    private readonly requestMessageService: RequestMessageService,
    private readonly generateFakeSignatureService: GenerateFakeSignatureService,
    ) {}

  @GrpcMethod(authGrpcConstants.SERVICE, "RequestMessage")
    public async requestMessage() {
        this.logger.debug("RequestMessage called")
        return this.requestMessageService.requestMessage()
    }

  @GrpcMethod(authGrpcConstants.SERVICE, "GenerateFakeSignature")
  public async generateFakeSignature(request: GenerateFakeSignatureRequest) {
      this.logger.debug("GenerateFakeSignature called")
      return this.generateFakeSignatureService.generateFakeSignature(request)
  }
}
