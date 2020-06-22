import { isUuid } from 'uuidv4';
import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';

import CreateUserService from './CreateUserService';

describe('CreateUserService', () => {
  it('should be able to create a new user', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const fakeHashProvider = new FakeHashProvider();

    const createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider,
    );

    const user = await createUser.execute({
      name: 'Daniel',
      email: 'teste@teste.com',
      password: '123456',
    });

    expect(user).toHaveProperty('id');
    expect(isUuid(user.id)).toBe(true);
    expect(user.name).toBe('Daniel');
    expect(user.email).toBe('teste@teste.com');
    expect(user.password).toBe('123456');
  });

  it('should not create user if email already used', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const fakeHashProvider = new FakeHashProvider();

    const createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider,
    );

    await createUser.execute({
      name: 'Daniel',
      email: 'teste@teste.com',
      password: '123456',
    });

    expect(
      createUser.execute({
        name: 'Daniel',
        email: 'teste@teste.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
