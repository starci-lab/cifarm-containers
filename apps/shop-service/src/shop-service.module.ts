import { Module } from '@nestjs/common';
import { ShopServiceController } from './shop-service.controller';
import { ShopServiceService } from './shop-service.service';

@Module({
  imports: [],
  controllers: [ShopServiceController],
  providers: [ShopServiceService],
})
export class ShopServiceModule {}
