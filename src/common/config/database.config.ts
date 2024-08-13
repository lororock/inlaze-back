import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
} as any;

export default dataSourceOptions;
