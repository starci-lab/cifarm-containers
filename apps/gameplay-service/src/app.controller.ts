import { Controller, Logger } from "@nestjs/common"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor() {}
}
