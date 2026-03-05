import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { UserCredits } from './entities/user-credits.entity';
import { UsersController } from './users.controller';
import { UserCreditsRepository } from './user-credits.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserCredits])],
  providers: [UsersService, UsersRepository, UserCreditsRepository],
  exports: [UsersService, UsersRepository, UserCreditsRepository],
  controllers: [UsersController],
})
export class UsersModule {}
