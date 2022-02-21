import User from "../src/models/User";
import faker from "faker";
import dotenv from "dotenv";

dotenv.config();
process.env.USERNAME = "master";

import "../src/database"; // initialize models
/* WARNING THIS WILL DROP THE CURRENT DATABASE */
seed();

async function seed() {
  // create tables
  await User.sync({ force: true });
  //insert data

  const users = new Array(10).fill(null).map((_, idx) =>
    User.create({
      id: idx + 1,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    })
  );

  await Promise.all(users);
}
