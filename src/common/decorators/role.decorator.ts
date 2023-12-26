import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/user/enum/user.enum';

export const IS_ROLE_KEY = 'rolekey';
export const Roles = (...roles: Role[]) => SetMetadata(IS_ROLE_KEY, roles);
