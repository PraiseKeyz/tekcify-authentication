import { IUser } from "../interface/user.interface";

export function sanitizeUser(user: IUser) {
  const { password, ...safeUser } = user;
  return safeUser;
}
