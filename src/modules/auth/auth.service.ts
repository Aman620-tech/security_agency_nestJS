import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // Find user by username or email
    const user = await this.userService.findByUsername(username);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated. Please contact administrator.');
    }

    // Validate password
    const isPasswordValid = await this.userService.validatePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login - Fix: Convert ObjectId to string using toString()
    const userId = user._id.toString();
    await this.userService.updateLastLogin(userId);

    return {
      id: userId,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      zoneName: user.zoneName,
      permissions: user.permissions,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        zoneName: user.zoneName,
        permissions: user.permissions,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Check if first user - make them director
    const userCount = await this.userService.findAll();
    
    if (userCount.length === 0) {
      createUserDto.role = UserRole.DIRECTOR;
    }
    
    const user = await this.userService.create(createUserDto);
    
    // Auto login after registration
    const userId = user._id.toString();
    
    const payload = {
      sub: userId,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        zoneName: user.zoneName,
      },
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userService.findOne(userId);
    const isPasswordValid = await this.userService.validatePassword(oldPassword, user.password);
    
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    
    await this.userService.update(userId, {
      newPassword: newPassword,
      currentPassword: oldPassword,
    } as any);
    
    return {
      message: 'Password changed successfully',
    };
  }

  async getProfile(userId: string) {
    return this.userService.findOne(userId);
  }
}