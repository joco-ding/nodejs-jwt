import dotenv from 'dotenv'
import Joi from 'joi'

dotenv.config()

process.env = {
  ...process.env,
  MIMETYPE: process.env.MIMETYPE.split(','),
  IMGSIZE: process.env.IMGSIZE.split('x'),
  THUMBSIZE: process.env.THUMBSIZE.split('x')
}

const envVarsSchema = Joi.object().keys({
  PORT: Joi.number().required(),
  DBPORT: Joi.required(),
  DBHOST: Joi.required(),
  DBNAME: Joi.required(),
  DBUSER: Joi.required(),
  DBPASS: Joi.required(),
  MIMETYPE: Joi.array().items(Joi.string()).required(),
  UPLOADPATH: Joi.required(),
  URLHOST: Joi.required(),
  IMGSIZE: Joi.array().length(2).items(Joi.number()).required(),
  THUMBSIZE: Joi.array().length(2).items(Joi.number()).required(),
}).unknown()

const { value, error } = envVarsSchema.validate(process.env)

if (error) throw new Error(`File konfigurasi env error: ${error.message}`)

export const { PORT, DBPORT, DBHOST, DBNAME, DBUSER, DBPASS, MIMETYPE, UPLOADPATH, URLHOST, IMGSIZE,THUMBSIZE } = value