import { Injectable, Logger } from "@nestjs/common"
import { Container } from "@src/env"
import { ExecService } from "./exec.service"
import { containerMap } from "./exec.constants"

@Injectable()
export class ExecDockerCoreService {
    private readonly logger = new Logger(ExecDockerCoreService.name)

    constructor(private readonly execService: ExecService) {}

    async build(container: Container = Container.GameplaySubgraph) {
        this.logger.debug(`Building container: ${container}...`)
        const { dockerfile, image } = containerMap[container]
        await this.execService.exec("docker", ["build", "-t", image, "-f", dockerfile, "."])
    }

    async push(container: Container = Container.GameplaySubgraph) {
        this.logger.debug(`Pushing container: ${container}...`)
        const { image } = containerMap[container]
        await this.execService.exec("docker", ["push", image])
    }
}
