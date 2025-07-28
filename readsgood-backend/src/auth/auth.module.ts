import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { BasicAuthGuard } from './basic-auth.guard';

@Module({
  imports: [UsersModule],
  providers: [BasicAuthGuard],
  exports: [BasicAuthGuard],
})
export class AuthModule {}
