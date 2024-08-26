import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsersService } from './users.service';

@Processor('status-update')
export class UserProcessor extends WorkerHost{
    constructor(private readonly userService: UsersService) {
        super();
    }
    async process(job: Job<{email:string,status:boolean}>){
        const {email,status} = job.data

        return await this.userService.updateStatus(email,status)
    }
}