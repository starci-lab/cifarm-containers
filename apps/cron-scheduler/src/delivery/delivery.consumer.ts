import { Injectable, Logger } from "@nestjs/common"
import { DeliveryService } from "./delivery.service"

@Injectable()
export class DeliveryConsumer {
    private readonly logger = new Logger(DeliveryConsumer.name)

    constructor(
        private readonly deliveryService: DeliveryService,
        //private readonly kafkaConsumersService: KafkaConsumersService
    ) {}

    // async onModuleInit() {
    //     const consumer = await this.kafkaConsumersService.createConsumer({
    //         groupId: KafkaGroupId.Delivery,
    //         topics: [KafkaTopic.Delivery]
    //     })
    //     consumer.run({
    //         eachMessage: async ({ topic }) => {
    //             switch (topic) {
    //             case KafkaTopic.Delivery:
    //                 {
    //                     await this.deliveryService.deliver()
    //                 }
    //                 break
    //             }
    //         }
    //     })
    // }
}
