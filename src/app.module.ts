import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    BullModule.forRoot({
      connection:{
          host:'redis',
          port:6379,
      }
    }),
    CacheModule.registerAsync({
      useFactory: async() => ({
          store: await redisStore({
            url: 'redis://redis:6379'
          })
      })
      ,
      isGlobal: true
    }),
    UsersModule
  ],
  controllers: [AppController,UsersController],
  providers: [AppService,UsersService],
})
export class AppModule {}

