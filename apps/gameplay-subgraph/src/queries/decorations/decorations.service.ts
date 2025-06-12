import { Injectable, Logger } from "@nestjs/common"
import { DecorationSchema, DecorationId } from "@src/databases"
import { StaticService } from "@src/gameplay/static"

@Injectable()
export class DecorationsService {
    private readonly logger = new Logger(DecorationsService.name)

    constructor(
        private readonly staticService: StaticService
    ) {}

    decorations(): Array<DecorationSchema> {
        return this.staticService.decorations
    }

    decoration(id: DecorationId): DecorationSchema {
        return this.staticService.decorations.find((decoration) => decoration.displayId === id)
    }
}
