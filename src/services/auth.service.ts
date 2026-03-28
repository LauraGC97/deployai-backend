import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/db';
import { User, UserPublic, RegisterDto, LoginDto } from '../models/user.model';
import mysql from 'mysql2/promise';

const JWT_SECRET     = process.env.JWT_SECRET     ?? 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export class AuthService {

  async register(dto: RegisterDto): Promise<{ user: UserPublic; token: string }> {
    // Comprueba si el email ya existe
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [dto.email]
    );
    const existing = (rows as User[]);
    if (existing.length > 0) {
      throw new Error('El email ya está registrado');
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Inserta el usuario
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [dto.email, hashedPassword, dto.name]
    );

    const insertId = (result as mysql.ResultSetHeader).insertId;

    const user: UserPublic = {
      id:         insertId,
      email:      dto.email,
      name:       dto.name,
      created_at: new Date().toISOString()
    };

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(dto: LoginDto): Promise<{ user: UserPublic; token: string }> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [dto.email]
    );

    const users = rows as User[];
    if (users.length === 0) {
      throw new Error('Email o contraseña incorrectos');
    }

    const user = users[0];
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