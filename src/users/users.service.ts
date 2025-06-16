import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async create(username: string, hashedPassword: string): Promise<User> {
        const newUser = new this.userModel({ username, password: hashedPassword });
        try {
            return await newUser.save();
        } catch (error) {
            if (error.code === 11000) {
                // Duplicate key error
                throw new ConflictException('Username already exists');
            }
            throw error;
        }
    }

    async findByUsername(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ username }).exec();
    }

    // users.service.ts
    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }


}