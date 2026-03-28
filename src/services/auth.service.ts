import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/db';
import { UserPublic, RegisterDto, LoginDto } from '../models/user.model';

const JWT_SECRET     = process.env.JWT_SECRET     ?? 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export class AuthService {

  async register(dto: RegisterDto): Promise<{ user: UserPublic; token: string }> {
    // Comprueba si el email ya existe
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [dto.email]
    );
    if (existing.rows.length > 0) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [dto.email, hashedPassword, dto.name]
    );

    const user: UserPublic = result.rows[0];
    const token = this.generateToken(user);
    return { user, token };
  }

  async login(dto: LoginDto): Promise<{ user: UserPublic; token: string }> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [dto.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Email o contraseña incorrectos');
    }

    const user = result.rows[0];
    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new Error('Email o contraseña incorrectos');
    }

    const userPublic: UserPublic = {
      id:         user.id,
      email:      user.email,
      name:       user.name,
      created_at: user.created_at
    };

    const token = this.generateToken(userPublic);
    return { user: userPublic, token };
  }

  verifyToken(token: string): UserPublic {
    return jwt.verify(token, JWT_SECRET) as UserPublic;
  }

  private generateToken(user: UserPublic): string {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }
}

export const authService = new AuthService();