import { Repository } from 'typeorm';
import NodeCache from 'node-cache';
import { AppDataSource } from '@src/database/AppDataSource';
import type { User } from '@src/schemas';
import { Auth as AuthEntity } from '@src/Entities/Auth';
import { User as UserEntity } from '@src/Entities/User';
import { UserService } from '@src/Services/UserService';
import { TokenService } from '@src/Services/TokenService';
import { ServerErrorException } from '@src/Exceptions/ServerErrorException';
import { UnauthorizedException } from '@src/Exceptions/UnauthorizedException';
import { config } from '@src/config';

interface FullUserInfo {
  user: UserEntity;
  auth: AuthEntity;
}

export class AuthModel {
  private USER_INFO_CACHE_KEY_PREFIX = 'USER_INFO_';
  private AUTH_HEADER_PREFIX = 'Bearer ';

  private userService: UserService;
  private tokenService: TokenService;
  private authRepository: Repository<AuthEntity>;
  private cache: NodeCache;

  constructor() {
    this.userService = new UserService();
    this.tokenService = new TokenService();
    this.authRepository = AppDataSource.getRepository(AuthEntity);
    this.cache = new NodeCache({
      stdTTL: config.CACHE_TTL,
      maxKeys: config.CACHE_MAX_KEYS,
    });
  }

  private async updateToken(auth: AuthEntity, refreshToken: string) {
    const mergedAuthRecord = this.authRepository.merge(auth, { refreshToken });
    await this.authRepository.save(mergedAuthRecord);
  }

  private async getFullUserInfo(email: string): Promise<FullUserInfo | null> {
    const cacheKey = this.USER_INFO_CACHE_KEY_PREFIX + email;
    const cachedInfo = this.cache.get<FullUserInfo>(cacheKey);

    if (cachedInfo) {
      return cachedInfo;
    }

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      return null;
    }

    const auth = await this.authRepository.findOneBy({ userId: user.id });

    if (!auth) {
      throw new ServerErrorException();
    }

    const info = {
      user,
      auth,
    };
    this.cache.set(cacheKey, info);

    return info;
  }

  private async generateAndSaveTokens(auth: AuthEntity, email: string) {
    const tokens = this.tokenService.generateTokens(auth.userId, email);
    await this.updateToken(auth, tokens.refreshToken);

    return tokens;
  }

  public async createUser(user: User) {
    const createdUser = await this.userService.create(user);

    if (createdUser) {
      await this.authRepository.save(
        this.authRepository.create({
          userId: createdUser.id,
          password: user.password,
        }),
      );

      return true;
    }

    return false;
  }

  public async loginUser(email: string, password: string) {
    const userInfo = await this.getFullUserInfo(email);

    if (!userInfo || userInfo.auth.password !== password) {
      throw new UnauthorizedException();
    }

    const { auth } = userInfo;

    return this.generateAndSaveTokens(auth, email);
  }

  public async refreshAuth(refreshToken: string) {
    if (!this.tokenService.validateRefreshToken(refreshToken)) {
      throw new UnauthorizedException();
    }

    const { email } = this.tokenService.decodeToken<{ email: string }>(refreshToken);
    const userInfo = await this.getFullUserInfo(email);

    if (!userInfo || userInfo.auth.refreshToken !== refreshToken || userInfo.user.email !== email) {
      throw new UnauthorizedException();
    }

    const { auth, user } = userInfo;

    this.cache.del(this.USER_INFO_CACHE_KEY_PREFIX + user.email);
    return this.generateAndSaveTokens(auth, email);
  }

  public validateAuth(authHeader: string) {
    if (!authHeader.includes(this.AUTH_HEADER_PREFIX)) {
      return false;
    }

    const authToken = authHeader.replace(this.AUTH_HEADER_PREFIX, '');

    return this.tokenService.validateAuthToken(authToken);
  }
}
