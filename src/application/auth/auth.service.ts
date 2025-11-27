import { UserRepository } from "@infrastructure/repositories/user.repository";
import { PasswordHasher } from "@infrastructure/security/password-hasher";
import { JwtProvider } from "@infrastructure/security/jwt.provider";
import { HttpException } from "@shared/http-exception";

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtProvider: JwtProvider
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new HttpException(409, "Email already in use");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.userRepository.createAndSave({
      email: input.email,
      passwordHash,
      name: input.name ?? null,
    });

    const token = this.jwtProvider.generateAccessToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new HttpException(401, "Invalid credentials");
    }

    const isValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new HttpException(401, "Invalid credentials");
    }

    const token = this.jwtProvider.generateAccessToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
