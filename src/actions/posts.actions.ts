import { CreationAttributes } from "sequelize/types";
import Post from "../models/Post";
import User from "../models/User";

export default class PostsActions {
  static getAll() {
    return Post.findAll({
      include: User,
    });
  }

  static create(post: CreationAttributes<Post>) {
    return Post.create(post);
  }
}
