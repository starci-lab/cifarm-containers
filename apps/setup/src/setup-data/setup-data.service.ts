import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SetupDataService {
    private readonly logger = new Logger(SetupDataService.name)

    constructor(private readonly dataSource: DataSource) {}

    async clearData() {
        this.logger.log("Clearing old data started")
        this.logger.log("Clearing old data finished")
    }

    async setupData() {
        const data = [
        // Add your seed data here
        { /* data object */ },
        { /* another data object */ },
        ];

        this.logger.log("Seeding data started")
        // await this.dataSource.insert(data)
        this.logger.log("Seeding data finished")
    }
}
