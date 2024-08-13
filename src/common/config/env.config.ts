import * as Joi from 'joi';

const JoiValidation = Joi.object({
  //Application
  APP_PORT: Joi.number().port().required(),

  //TMDB
  TMDB_API_KEY: Joi.string().required(),
  TMDB_URL: Joi.string().required(),
  TMDB_TOKEN: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),

  //Database
  DB_HOST: Joi.required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().required(),

  //Application Client
  APP_CLIENT_URL: Joi.string().required(),

  // SMTP
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_SECURE: Joi.boolean().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),

  // Cache
  CACHE_TTL: Joi.number().required(),
});

export default JoiValidation;
