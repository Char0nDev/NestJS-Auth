import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class ResetToken {
  @Prop({ required: true })
  token: string;
  @Prop({ required: true })
  userId: mongoose.Types.ObjectId;
  @Prop()
  expiryDate: Date;
}

export const ResetTokenSchema = SchemaFactory.createForClass(ResetToken);
