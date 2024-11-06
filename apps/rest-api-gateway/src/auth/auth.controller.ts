import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
} from "@nestjs/common"
import { healthcheckGrpcConstants } from "@apps/healthcheck-service"
import { ClientGrpc } from "@nestjs/microservices"
import { IAuthService } from "./auth.service"
import { lastValueFrom } from "rxjs"
import { ApiResponse, ApiTags } from "@nestjs/swagger"
import {
    authGrpcConstants,
    GenerateTestSignatureResponse,
    RequestMessageResponse,
} from "@apps/auth-service"
import { TransformedSuccessResponse } from "../transform"

@ApiTags("Auth")
@Controller("auth")
export class AuthController implements OnModuleInit {
    private readonly logger = new Logger(AuthController.name)

    constructor(@Inject(authGrpcConstants.NAME) private client: ClientGrpc) {}

    private authService: IAuthService
    onModuleInit() {
        this.authService = this.client.getService<IAuthService>(
            healthcheckGrpcConstants.SERVICE,
        )
    }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: TransformedSuccessResponse<RequestMessageResponse> })
  @Get()
    public async requestMessage(): Promise<
    TransformedSuccessResponse<RequestMessageResponse>
    > {
        const data = await lastValueFrom(this.authService.requestMessage({}))
        return {
            data,
            status: HttpStatus.OK,
            message: "Success",
        }
    }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
      type: TransformedSuccessResponse<GenerateTestSignatureResponse>,
  })
  @Get()
  public async generateTestSignature(): Promise<
    TransformedSuccessResponse<GenerateTestSignatureResponse>
    > {
      const data = await lastValueFrom(
          this.authService.generateTestSignature({}),
      )
      return {
          data,
          status: HttpStatus.OK,
          message: "Success",
      }
  }
}
