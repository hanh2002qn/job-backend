/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { UserRole } from '../modules/users/entities/user.entity';
import { ProfilesService } from '../modules/profiles/profiles.service';
import { UpdateProfileDto } from '../modules/profiles/dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const profilesService = app.get(ProfilesService);

  const defaultUsers = [
    {
      email: 'user@example.com',
      password: 'Password123',
      role: UserRole.USER,
      fullName: 'Default User',
    },
    {
      email: 'admin@example.com',
      password: 'AdminPassword123',
      role: UserRole.ADMIN,
      fullName: 'Default Admin',
    },
  ];

  // Generate 10 fake users
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    defaultUsers.push({
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: 'Password123',
      role: UserRole.USER,
      fullName: `${firstName} ${lastName}`,
    });
  }

  const salt = await bcrypt.genSalt();
  const commonPasswordHash = await bcrypt.hash('Password123', salt);

  for (const userData of defaultUsers) {
    const existingUser = await usersService.findOneByEmail(userData.email);
    if (existingUser) {
      console.log(`User ${userData.email} already exists.`);
      continue;
    }

    const passwordHash =
      userData.password === 'Password123'
        ? commonPasswordHash
        : await bcrypt.hash(userData.password, salt);

    const user = await usersService.create({
      email: userData.email,
      passwordHash,
      isVerified: true,
      role: userData.role,
    });

    // Create/Update profile
    const profileData: UpdateProfileDto = {
      fullName: userData.fullName,
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      skills: faker.helpers.arrayElements(
        ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Python', 'Docker'],
        { min: 2, max: 4 },
      ),
    };
    await profilesService.updateByUserId(user.id, profileData);

    console.log(`Created ${userData.role} account: ${userData.email} / ${userData.password}`);
  }

  await app.close();
}

void bootstrap();
