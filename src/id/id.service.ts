import { Inject } from "@nestjs/common"
import { Logger } from "@nestjs/common"
import { Injectable, OnModuleInit } from "@nestjs/common"
import { v4 } from "uuid"
import { MODULE_OPTIONS_TOKEN } from "./id.module-definition"
import { IdServiceOptions } from "./types"
// id service create an unique Id for better logging and communication
@Injectable()
export class IdService implements OnModuleInit {
    private readonly logger = new Logger(IdService.name)
    public id: string
    public name: string
    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: IdServiceOptions
    ) {
        this.name = options.name
    }

    public onModuleInit() {
        this.id = v4()
        this.logger.log(`Service initialized with id: ${this.id} and name: ${this.name}`)
    }
}