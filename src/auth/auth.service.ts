import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { SignUpDto } from './dtos/signUp.dto';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
import { ResetToken } from './schemas/rest-token.schema';
import { MailService } from './services/mail.service';


@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(RefreshToken.name) private RefreshTokenModel: Model<RefreshToken>,
        @InjectModel(ResetToken.name) private ResetTokenModel : Model<ResetToken> ,
        private mailService : MailService,
        private jwtService: JwtService,
    ){}

    async signUp(signUpData : SignUpDto){
        const {email , username , password} = signUpData;

        const emailInUse =  await this.UserModel.findOne({
            email,
        });

        if(emailInUse){
            throw new BadRequestException('Email already in use.')
        };

        const hashedPassword = await bcrypt.hash(password , 10);

        await this.UserModel.create({
            username,
            email,
            password : hashedPassword
        })
    };

    async login(singInData : LoginDto){
        const {email , password} = singInData;

        const user = await this.UserModel.findOne({ email });
        if(!user){
            throw new UnauthorizedException('Wrong info.')
        };

        const passwordMatch = await bcrypt.compare(password ,user.password);
        if(!passwordMatch){
            throw new UnauthorizedException('Wrong info.')
        }

        return this.generateAccessToken(user._id)
    }

    async generateAccessToken(userId){
        const accessToken = this.jwtService.sign({userId} , {expiresIn : '1h'});
        const refreshToken = uuidv4();

        await this.storeRefreshToken(refreshToken , userId)
        
        return {
            accessToken,
            refreshToken
        }
    };

    async storeRefreshToken(refreshToken : string , userId){
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 3);

        await this.RefreshTokenModel.create({
            token : refreshToken,
            userId,
            expiryDate
        })
    };

    async refreshTokens(refreshToken : string){
        const token = await this.RefreshTokenModel.findOneAndDelete({
            token : refreshToken,
            expiryDate : {$gte : new Date()}
        });

        if(!token){
            throw new UnauthorizedException('Refresh token is invalid.')
        };

        return this.generateAccessToken(token.userId);
    };

    async changePassword(oldPassword : string , newPassword : string , userId: mongoose.Types.ObjectId){
        const user = await this.UserModel.findById(userId);

        if(!user) {
            return new NotFoundException('User not found.');
        }

        const passwordMatch = await bcrypt.compare(oldPassword , user.password);

        if(!passwordMatch) {
            return new HttpException('The old password wrong.', HttpStatus.UNAUTHORIZED)
        }

        const newHashPassword = await bcrypt.hash(newPassword , 10);
        user.password = newHashPassword;

        await user.save()
        return {
            message : 'The password has been changed.',
            statusCode : 200
        }
    };

    async forgotPassword(email : string){
        const user = await this.UserModel.findOne({email});

        if(!user){
            throw new NotFoundException('The user is not found.')
        };

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getMinutes() + 5 );
        
        const resetToken = uuidv4()
        await this.ResetTokenModel.create({
            userId : user._id,
            token : resetToken,
            expiryDate : expiryDate
        });

        this.mailService.sendPasswordResetEmail(user.email , resetToken)

        return {
            message : 'you well received an email.'
        }
    };

    async resetPassword(resetToken : string , newPassword : string){
        const token = await this.ResetTokenModel.findOne({
            token : resetToken,
            expiryDate : {$gte : new Date()}
        });

        if(!token) {
            throw new UnauthorizedException('Invalid token.');
        }

        const user = await this.UserModel.findById(token.userId);
        if(!user) throw new NotFoundException('The user not found.');

        user.password = await bcrypt.hash(newPassword , 10);
        await user.save()
    }
}
