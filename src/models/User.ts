import { Table, Model, Column, AllowNull, HasMany } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import types from "../dataTypes";
import Post from "./Post";

@Table({
  modelName: "User",
})
export default class User extends Model {
  @Column({
    type: types.uuid,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  })
  username: string;

  @AllowNull(false)
  @Column({ type: types.string })
  firstName!: string;

  @AllowNull(false)
  @Column({ type: types.string })
  lastName!: string;

  @Column({ type: types.virtual })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @HasMany(() => Post)
  posts: Post[];
}
