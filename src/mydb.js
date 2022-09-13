import mysql from 'mysql2'
import { DBHOST, DBNAME, DBPASS, DBPORT, DBUSER } from './config.js'

const pool = mysql.createPool({
  host: DBHOST, port: DBPORT, database: DBNAME, user: DBUSER, password: DBPASS
})
const promisePool = pool.promise()

export default promisePool