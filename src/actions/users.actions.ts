import { CreationAttributes } from "sequelize/types";
import User from "../models/User";

export default class UsersActions {
  static getById(username: string) {
    return User.findOne({ where: { username } });
  }

  static getAll() {
    return User.findAll();
  }

  static create(user: CreationAttributes<User>) {
    return User.create(user);
  }
}
