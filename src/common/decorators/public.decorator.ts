import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'ispublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
