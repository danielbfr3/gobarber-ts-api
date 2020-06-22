import { getRepository, Repository } from 'typeorm';

import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import User from '@modules/users/infra/typeorm/entities/User';
import CreateUserDTO from '@modules/users/dtos/ICreateUserDTO';

class UsersRepository implements IUsersRepository {
  private ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = getRepository(User);
  }

  public async findById(id: string): Promise<User | undefined> {
    const findUser = this.ormRepository.findOne({
      where: {
        id,
      },
    });

    return findUser;
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const findUser = this.ormRepository.findOne({
      where: {
        email,
      },
    });

    return findUser;
  }

  public async create({ name, email, password }: CreateUserDTO): Promise<User> {
    const newUser = this.ormRepository.create({
      name,
      email,
      password,
    });

    await this.ormRepository.save(newUser);

    return newUser;
  }

  public async save(user: User): Promise<User> {
    return this.ormRepository.save(user);
  }
}

export default UsersRepository;
