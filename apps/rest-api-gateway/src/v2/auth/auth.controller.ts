import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
    Post
} from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { lastValueFrom } from "rxjs"
import { ApiResponse, ApiTags } from "@nestjs/swagger"
import { grpcData, GrpcServiceName } from "@src/grpc"
import {
    RequestMessageResponse,
    GenerateTestSignatureResponse,
    GenerateTestSignatureRequest,
    VerifySignatureResponse,
    VerifySignatureRequest,
    IGameplayService,
    RefreshResponse,
    RefreshRequest
} from "@apps/gameplay-service"

@ApiTags("Auth")
@Controller({
    path: "auth",
    version: "2"
})
export class AuthController implements OnModuleInit {
    private readonly logger = new Logger(AuthController.name)

    constructor(@Inject(grpcData[GrpcServiceName.Gameplay].name) private grpcClient: ClientGrpc) {}

    private gameplayService: IGameplayService
    
    onModuleInit() {
        this.gameplayService = this.grpcClient.getService<IGameplayService>(
            grpcData[GrpcServiceName.Gameplay].service
        )
    } 
 
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: RequestMessageResponse })
    @Post("message")
    public async requestMessage(): Promise<RequestMessageResponse> {
        return await lastValueFrom(this.gameplayService.requestMessage({}))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: GenerateTestSignatureResponse
    })
    @Post("test-signature")
    public async generateTestSignature(
        @Body() request: GenerateTestSignatureRequest
    ): Promise<GenerateTestSignatureResponse> {
        return await lastValueFrom(this.gameplayService.generateTestSignature(request))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: VerifySignatureResponse
    })
    @Post("verify-signature")
    public async verifySignature(
        @Body() request: VerifySignatureRequest
    ): Promise<VerifySignatureResponse> {
        return await lastValueFrom(this.gameplayService.verifySignature(request))
    }

    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: RefreshResponse
    })
    @Post("refresh")
    public async refresh(
        @Body() request: RefreshRequest
    ): Promise<RefreshResponse> {
        return await lastValueFrom(this.gameplayService.refresh(request))
    }
}
