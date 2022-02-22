import {
  Model,
  Column,
  Table,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";
import types from "../dataTypes";
import User from "./User";

@Table({
  modelName: "Post",
})
export default class Post extends Model {
  @Column({ type: types.string })
  message: string;

  @ForeignKey(() => User)
  @Column({
    type: types.uuid,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;
}
