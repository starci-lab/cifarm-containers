import { Injectable, Logger } from "@nestjs/common"
import { SupplyId, SupplySchema } from "@src/databases"
import { StaticService } from "@src/gameplay"

@Injectable()
export class SuppliesService {
    private readonly logger = new Logger(SuppliesService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    supply(id: SupplyId): SupplySchema {
        return this.staticService.supplies.find((supply) => supply.displayId === id)
    }

    supplies(): Array<SupplySchema> {
        return this.staticService.supplies
    }
}
