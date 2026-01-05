import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { UserRole } from '../modules/users/entities/user.entity';
import { ProfilesService } from '../modules/profiles/profiles.service';
import * as bcrypt from 'bcrypt';

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
        }
    ];

    for (const userData of defaultUsers) {
        const existingUser = await usersService.findOneByEmail(userData.email);
        if (existingUser) {
            console.log(`User ${userData.email} already exists.`);
            continue;
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(userData.password, salt);

        const user = await usersService.create({
            email: userData.email,
            passwordHash,
            isVerified: true,
            role: userData.role,
        });

        // Create profile
        await profilesService.updateByUserId(user.id, {
            fullName: userData.fullName,
        });

        console.log(`Created ${userData.role} account: ${userData.email} / ${userData.password}`);
    }

    await app.close();
}
bootstrap();
