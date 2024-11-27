import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
    Post,
    UseInterceptors
} from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { lastValueFrom } from "rxjs"
import { ApiResponse, ApiTags } from "@nestjs/swagger"
import {
    authGrpcConstants,
    GenerateTestSignatureRequest,
    GenerateTestSignatureResponse,
    IAuthService,
    RequestMessageResponse,
    VerifySignatureRequest,
    VerifySignatureResponse
} from "@apps/auth-service"
import { AuthInterceptor } from "./auth.interceptor"

@ApiTags("Auth")
@Controller("auth")
export class AuthController implements OnModuleInit {
    private readonly logger = new Logger(AuthController.name)

    constructor(@Inject(authGrpcConstants.NAME) private client: ClientGrpc) {}

    private authService: IAuthService
    onModuleInit() {
        this.authService = this.client.getService<IAuthService>(authGrpcConstants.SERVICE)
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: RequestMessageResponse })
    @Post("message")
    public async requestMessage(): Promise<RequestMessageResponse> {
        return await lastValueFrom(this.authService.requestMessage({}))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: GenerateTestSignatureResponse
    })

    @Post("test-signature")
    public async generateTestSignature(
        @Body() request: GenerateTestSignatureRequest
    ): Promise<GenerateTestSignatureResponse> {
        return await lastValueFrom(this.authService.generateTestSignature(request))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: VerifySignatureResponse
    })
    @UseInterceptors(AuthInterceptor)
    @Post("verify-signature")
    public async verifySignature(
        @Body() request: VerifySignatureRequest
    ): Promise<VerifySignatureResponse> {
        return await lastValueFrom(this.authService.verifySignature(request))
    }
}
