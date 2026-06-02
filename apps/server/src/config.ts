import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  serverPort: Number(process.env.SERVER_PORT ?? 3001),
  webOrigin: process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173",
  apiBaseUrl: process.env.API_BASE_URL ?? "http://127.0.0.1:3001",
  jwt: {
    secret: process.env.JWT_SECRET ?? "life-museum-dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d"
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? "admin@life.local",
    password: process.env.ADMIN_PASSWORD ?? "life-museum-admin",
    nickname: process.env.ADMIN_NICKNAME ?? "Life Museum"
  },
  mysql: {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    database: process.env.MYSQL_DATABASE ?? "life_museum",
    user: process.env.MYSQL_USER ?? "life_museum",
    password: process.env.MYSQL_PASSWORD ?? "life_museum_password"
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000",
    publicUrl: process.env.S3_PUBLIC_BASE_URL ?? process.env.S3_PUBLIC_URL ?? "http://127.0.0.1:9000/life-museum",
    accessKeyId: process.env.S3_ACCESS_KEY ?? "life_museum_minio",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "life_museum_minio_password",
    bucket: process.env.S3_BUCKET ?? "life-museum",
    region: process.env.S3_REGION ?? "us-east-1"
  }
};
