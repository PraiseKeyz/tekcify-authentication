import { Response } from "express";

type ApiResponseOptions<T = any> = {
  res: Response;
  status?: number;
  message?: string;
  data?: T;
  error?: any;
};

export function sendResponse<T = any>({
  res,
  status = 200,
  message,
  data,
  error,
}: ApiResponseOptions<T>) {
  return res.status(status).json({
    status: status < 400 ? "success" : "error",
    message,
    data,
    error,
  });
}
