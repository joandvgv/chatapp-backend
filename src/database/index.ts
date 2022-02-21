import { Sequelize } from "sequelize-typescript";
import cls from "cls-hooked";
import path from "path";
const namespace = cls.createNamespace("sequelize-transactions");

Sequelize.useCLS(namespace); // allows to use transactions w/o passing it to every call inside trans block

export const sequelize = new Sequelize(
  process.env.DB_NAME ?? "",
  process.env.USERNAME ?? "",
  process.env.PASSWORD ?? "",
  {
    host: process.env.POSTGRESQL_HOST ?? "",
    dialect: "postgres",
    port: (process.env.POSTGRESQL_PORT as any) ?? 0,
    define: {
      freezeTableName: true,
    },

    models: [path.join(__dirname, "..", "models")],
  }
);
