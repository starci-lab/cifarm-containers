import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { CoreV1Api, KubeConfig } from "@kubernetes/client-node"

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)
    constructor() {}

    @Cron("*/1 * * * * *")
    async handleCron() {
        console.log("Called every second")
        const kc = new KubeConfig()
        kc.loadFromDefault()
        const k8sApi = kc.makeApiClient(CoreV1Api)
        this.logger.debug("Called every second")
        const podsRes = await k8sApi.listNamespacedPod("default")
        this.logger.debug(podsRes.body)
    }
}
