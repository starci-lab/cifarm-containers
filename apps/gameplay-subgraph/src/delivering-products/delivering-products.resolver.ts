import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { DeliveringProductEntity } from "@src/databases"
import { GraphqlUser } from "@src/decorators"
import { UserLike } from "@src/jwt"
import { DeliveringProductService } from "./delivering-products.service"
import { GetDeliveringProductsByUserIdArgs } from "./delivering-products.dto"

@Resolver()
export class DeliveringProductResolver {
    private readonly logger = new Logger(DeliveringProductResolver.name)

    constructor(private readonly deliveringProductsService: DeliveringProductService) {}

    @Query(() => DeliveringProductEntity, {
        name: "deliveringProductsByUserId",
        nullable:true
    })
    async getDeliveringProductsByUserId(@GraphqlUser() user: UserLike, @Args("args") args: GetDeliveringProductsByUserIdArgs): Promise<Array<DeliveringProductEntity>> {
        this.logger.debug(`getDeliveringProductsByUserId: userId=${user?.id} args=${JSON.stringify(args)}`)

        return this.deliveringProductsService.getDeliveringProductsByUserId({
            ...args,
            userId: user?.id
        })
    }
}
