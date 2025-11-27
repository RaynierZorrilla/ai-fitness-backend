import { AppDataSource } from "@config/data-source";
import { User } from "@domain/entities/user.entity";

export class UserRepository {
  private repo = AppDataSource.getRepository(User);

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async createAndSave(data: { email: string; passwordHash: string; name?: string | null }): Promise<User> {
    const user = this.repo.create({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name ?? null,
    });

    return this.repo.save(user);
  }
}
