import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BullModule } from '@nestjs/bullmq';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProcessor } from './user.process';
@Module({
  imports:[
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
    name:'status-update'
  })
  ],
  controllers: [UsersController],
  providers: [UsersService,UserProcessor],
  exports: [UsersService,BullModule],
})
export class UsersModule {}
