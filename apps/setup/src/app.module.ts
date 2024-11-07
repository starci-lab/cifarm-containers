import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envConfig } from '@src/config';
import { SetupDataModule } from './setup-data';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
      envFilePath: [".env.local"],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
        type: "postgres",
        host: envConfig().database.postgres.gameplay.host,
        port: envConfig().database.postgres.gameplay.port,
        username: envConfig().database.postgres.gameplay.user,
        password: envConfig().database.postgres.gameplay.pass,
        database: envConfig().database.postgres.gameplay.dbName,    
        autoLoadEntities: true,
        synchronize: true,
    }),
    SetupDataModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
