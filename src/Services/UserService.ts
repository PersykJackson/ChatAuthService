import { z } from 'zod';
import { User } from '@src/schemas';
import { User as UserEntity } from '@src/Entities/User';

export class UserService {
  public async create(user: z.infer<typeof User>): Promise<UserEntity | null> {
    return fetch(`${process.env.USER_SERVICE_URI}/`, {
      method: 'POST',
      body: JSON.stringify({ email: user.email, name: user.name }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      if (response.status === 201) {
        return response.json();
      }

      return null;
    });
  }

  public async getUserByEmail(email: string): Promise<UserEntity | null> {
    return fetch(`${process.env.USER_SERVICE_URI}/by-email/${email}`, {
      method: 'GET',
    }).then(response => response.json());
  }
}
