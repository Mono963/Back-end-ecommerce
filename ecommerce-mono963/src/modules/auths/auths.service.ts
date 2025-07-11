import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/users.service';
import { SignUpDto } from './Dto/auths.Dto';

@Injectable()
export class AuthsService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signin(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Credenciales inválidas');
    }

    const user = await this.userService.findByEmail(email);

    const isMatch = user && (await bcrypt.compare(password, user.password));

    if (!user || !isMatch) {
      throw new BadRequestException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      expiresIn: 3600,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  }

  async signup(data: SignUpDto) {
    const { password, confirmPassword, ...rest } = data;

    if (!password || !confirmPassword) {
      throw new BadRequestException('Debe proporcionar ambas contraseñas');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const createdUser = await this.userService.createUserService({
        ...rest,
        password: hashedPassword,
        isAdmin: false,
      });

      return createdUser;
    } catch (err) {
      console.error('[AuthsService:signup] →', err);
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }
}
