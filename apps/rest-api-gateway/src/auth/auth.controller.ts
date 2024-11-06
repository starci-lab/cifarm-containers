import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
    Post,
} from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { IAuthService } from "./auth.service"
import { lastValueFrom } from "rxjs"
import { ApiResponse, ApiTags } from "@nestjs/swagger"
import {
    authGrpcConstants,
    GenerateTestSignatureRequest,
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
            authGrpcConstants.SERVICE,
        )
    }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: TransformedSuccessResponse<RequestMessageResponse> })
  @Post("message")
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
  @Post("test-signature")
  public async generateTestSignature(
    @Body() request: GenerateTestSignatureRequest,
  ): Promise<TransformedSuccessResponse<GenerateTestSignatureResponse>> {
      const data = await lastValueFrom(
          this.authService.generateTestSignature(request),
      )
      return {
          data,
          status: HttpStatus.OK,
          message: "Success",
      }
  }
}
