import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import FakeUserTokensRepository from '@modules/users/repositories/fakes/FakeUserTokensRepository';
import ResetPasswordService from '@modules/users/services/ResetPasswordService';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
// import UsersRepository from '../infra/typeorm/repositories/UsersRepository';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserTokensRepository: FakeUserTokensRepository;
let resetPassword: ResetPasswordService;
let fakeHashProvider: FakeHashProvider;

describe('ResetPassword', () => {
  beforeEach(() => {
    fakeUserTokensRepository = new FakeUserTokensRepository();
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();
    resetPassword = new ResetPasswordService(
      fakeUsersRepository,
      fakeUserTokensRepository,
      fakeHashProvider,
    );
  });

  it('should be able to reset the password', async () => {
    const newPassword = 'teste#teste';

    const user = await fakeUsersRepository.create({
      email: 'teste@teste.com',
      name: 'teste teste',
      password: 'teste@teste',
    });

    const userToken = await fakeUserTokensRepository.generate(user.id);

    const generateHash = jest.spyOn(fakeHashProvider, 'generateHash');

    await resetPassword.execute({
      token: userToken.token,
      password: newPassword,
    });

    const updatedUser = await fakeUsersRepository.findById(user.id);

    expect(generateHash).toHaveBeenCalledWith(newPassword);
    expect(updatedUser?.password).toBe(newPassword);
  });

  it('should not be able to reset the password with non-existing token', async () => {
    await expect(
      resetPassword.execute({
        password: 'fakepassword',
        token: 'faketoken',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset the password for non-existing user', async () => {
    const token = await fakeUserTokensRepository.generate('non-existing-user');

    await expect(
      resetPassword.execute({
        password: 'fakepassword',
        token: token.token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to reset password if if it was reseted within 2 hours', async () => {
    const user = await fakeUsersRepository.create({
      email: 'teste@teste.com',
      name: 'teste teste',
      password: 'teste@teste',
    });

    const userToken = await fakeUserTokensRepository.generate(user.id);

    jest.spyOn(Date, 'now').mockImplementationOnce(() => {
      const customDate = new Date();

      return customDate.setHours(customDate.getHours() + 3);
    });

    await expect(
      resetPassword.execute({
        token: userToken.token,
        password: 'novasenha',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
