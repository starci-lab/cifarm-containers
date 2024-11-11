import { BuyAnimalRequest, BuyAnimalResponse } from "@apps/shop-service/src/buy-animal"
import { shopGrpcConstants } from "@apps/shop-service/src/constants"
import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Inject,
    Logger,
    OnModuleInit,
    Post,
    UseGuards,
} from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger"
import { User } from "@src/decorators"
import { UserLike } from "@src/services"
import { lastValueFrom } from "rxjs"
import { IShopService } from "./shop.service"
import { RestJwtAuthGuard } from "@src/guards"

@ApiTags("Shop")
@Controller("shop")
// @ApiBearerAuth()
// @UseGuards(RestJwtAuthGuard)
export class ShopController implements OnModuleInit {
    private readonly logger = new Logger(ShopController.name)

    constructor(@Inject(shopGrpcConstants.NAME) private client: ClientGrpc) {}

    private shopService: IShopService
    onModuleInit() {
        this.shopService = this.client.getService<IShopService>(
            shopGrpcConstants.SERVICE,
        )
    }

  @HttpCode(HttpStatus.OK)
  @ApiResponse({
      type: BuyAnimalResponse,
  })
  @Post("buy-animal")
    public async buyAnimal(
    @Body() request: BuyAnimalRequest,
    ): Promise<BuyAnimalResponse> {
        try{
            // request.userId = user.id
            this.logger.log(`Processing animal purchase for user ${request.userId}`)
            return await lastValueFrom(this.shopService.buyAnimal(request))
        } catch (error) {
            this.logger.error(`Error processing animal purchase for user ${request.userId}`)
            throw error
        }
    }
}
