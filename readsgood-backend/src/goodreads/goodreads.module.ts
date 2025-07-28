import { Module } from '@nestjs/common';
import { GoodreadsService } from './goodreads.service';
import { GoodreadsController } from './goodreads.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [GoodreadsService],
  controllers: [GoodreadsController],
  exports: [GoodreadsService],
})
export class GoodreadsModule {}
