// Optionally define the token payload you expect to receive
export type TokenPayload = {
  username: string;
  firstName: string;
  lastName: string;
};

export const isTokenPayload = (token: any): token is TokenPayload =>
  ["username", "firstName", "lastName"].every((key) => !!token?.[key]);
