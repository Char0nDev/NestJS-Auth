import { IsEmail, IsString, IsStrongPassword, Length } from "class-validator"


export class SignUpDto {
    
    @IsString()
    @Length(4)
    
    username: string

    @IsEmail()
    email: string

    @IsStrongPassword()
    password : string
}