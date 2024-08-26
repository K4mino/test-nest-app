import { Injectable,NotFoundException,ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 } from 'uuid';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, 
    @InjectQueue('status-update') private readonly statusUpdateQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager:Cache
  ){}
  async create(createUserDto: CreateUserDto) {
    const isEmailExist = await this.userRepository.findOne({
      where: {email: createUserDto.email}
    })

    if(!isEmailExist) {
    const user = this.userRepository.create({
      ...createUserDto,
      id: v4(),
      status:false
    });
    const savedUser = await this.userRepository.save(user);

    await this.statusUpdateQueue.add('status-bull',{
      email:savedUser.email,
      status:true
    },
    {delay:10000}
    );

    return {
      statusCode: 201,
      message: 'SUCCESS',
      user:{
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        status: savedUser.status
      }
    }
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'ERR_USER_EMAIL_EXISTS'
    });
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const cachedUser = await this.cacheManager.get<User>(id);

  if (cachedUser) {
    return {
      statusCode: 200,
      message: 'SUCCESS',
      user: {
        id: cachedUser.id,
        name: cachedUser.name,
        email: cachedUser.email,
        status: cachedUser.status,
      },
    };
  }

    const user = await this.userRepository.findOne({ where: { id } });
 
    if (!user) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'ERR_USER_NOT_FOUND'
      });
    }

    await this.cacheManager.set(id, user, 1800000);

    return {
      statusCode: 200,
      message:'SUCCESS',
      user:{
        name: user.name,
        email: user.email,
        status: user.status
      }
    };
  }


  async updateStatus(email: string, status: boolean) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('ERR_USER_NOT_FOUND');
    }

    user.status = status;
    await this.userRepository.save(user);

    return {
      name: user.name,
      email: user.email,
      status: user.status
    };
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
