// src/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { MongoServerError } from 'mongodb'; // ✅ Import this

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(username: string, hashedPassword: string, avatar?: string): Promise<User> {
    const newUser = new this.userModel({ username, password: hashedPassword, avatar });

    try {
      return await newUser.save();
    } catch (err: any) {
      // ✅ Check for MongoServerError explicitly
      if (err instanceof MongoServerError && err.code === 11000) {
        console.error('⚠️ Duplicate username:', err.keyValue);
        throw new ConflictException('Username exists');
      }

      console.error('❌ Unknown error while creating user:', err);
      throw err;
    }
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}
