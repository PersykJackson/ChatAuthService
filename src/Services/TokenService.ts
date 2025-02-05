import jwt from 'jsonwebtoken';
import type { Auth } from '@src/schemas';
import { config } from '@src/config';

export class TokenService {
  private generateToken(payload: Record<string, string | number>, secret: string, ttl: number): string {
    return jwt.sign(payload, secret, { expiresIn: ttl });
  }

  private validateToken(token: string, secret: string): boolean {
    try {
      jwt.verify(token, secret);

      return true;
    } catch {
      return false;
    }
  }

  public generateTokens(userId: number, email: string): Auth {
    return {
      authToken: this.generateToken({ userId }, process.env.APP_AUTH_SECRET_KEY!, config.AUTH_TOKEN_TTL),
      refreshToken: this.generateToken({ email }, process.env.APP_REFRESH_SECRET_KEY!, config.REFRESH_TOKEN_TTL),
    };
  }

  public validateAuthToken(token: string): boolean {
    return this.validateToken(token, process.env.APP_AUTH_SECRET_KEY!);
  }

  public validateRefreshToken(token: string): boolean {
    return this.validateToken(token, process.env.APP_REFRESH_SECRET_KEY!);
  }

  public decodeToken<T>(token: string): T {
    return jwt.decode(token) as T;
  }
}
