import { v4 as uuidv4 } from 'uuid'
import promisePool from './mydb.js'
import jwt from 'jsonwebtoken'

const registerUser = async (req, res) => {
  const { userid, password, nama } = req.body

  let ok = false
  let message = 'Gagal'
  let data = {}

  const polaRegex = new RegExp('^[a-z0-9]{6,20}$')

  if (userid.match(polaRegex) === null) {
    data = 'UserID hanya berupa huruf kecil dan angka dengan panjang 6 hingga 20 karakter'
  } else {
    try {
      const [dbres, _] = await promisePool.execute("INSERT INTO tb_users (userid, password, name) VALUES (?, SHA2(?, 256), ?)", [userid, password, nama])
      if (typeof dbres.insertId === 'number' && dbres.insertId > 0) {
        const [rows, _] = await promisePool.query("SELECT userid, name FROM tb_users WHERE id=?", [dbres.insertId])
        if (rows.length === 1) {
          data = rows[0]
          ok = true
          message = 'Berhasil'
        }
      } else {
        data = dbres
      }
    } catch (error) {
      if (typeof error.code === 'string' && error.code === 'ER_DUP_ENTRY') {
        data = `UserID ${userid} sudah digunakan`
      } else {
        data = error
      }
    }
  }

  res.json({ ok, message, data })
}

const getToken = async (userid) => {
  let token = ''
  try {
    const [rows, _] = await promisePool.query("SELECT token FROM tb_users WHERE userid=?", userid)
    if (rows.length === 1) {
      token = rows[0].token
    }
  } catch (error) {
    console.error(error)
  }
  return token
}

const cekToken = async (token) => {
  let userid = ''
  try {
    const [rows, _] = await promisePool.query("SELECT userid FROM tb_users WHERE token=?", token)
    if (rows.length === 1) {
      userid = rows[0].userid
    }
  } catch (error) {
    console.error(error)
  }
  return userid
}

const signIn = async (req, res) => {
  const { userid, password } = req.body

  let ok = false
  let message = 'Gagal'
  let data = {}

  try {
    const [rows, _] = await promisePool.query("SELECT password, SHA2(?, 256) userpassword FROM tb_users WHERE userid=?", [password, userid])
    data = 'Silakan ulangi kembali'
    if (rows.length === 1) {
      const respondata = rows[0]
      if (typeof respondata.password === 'string' && typeof respondata.userpassword === 'string' && respondata.password === respondata.userpassword) {
        let token = ''
        while (true) {
          token = uuidv4()
          if (await cekToken(token) === '') break
        }
        await promisePool.execute("UPDATE tb_users SET token=? WHERE userid=?", [token, userid])
        console.log(JSON.stringify({ token }))
        ok = true
        message = 'Berhasil'
        data = jwt.sign({ userid }, token, { expiresIn: "1h" })
      }
    }
  } catch (error) {
    console.error(error)
    if (typeof error.code === 'string') {
      data = error.code
    } else {
      data = error
    }
  }

  res.json({ ok, message, data })
}

const isValidToken = async (req, res, next) => {
  let ok = false
  let message = 'Gagal'

  if (typeof req.header('token') === 'undefined' || req.header('token') === '') {
    return res.status(403).json({ ok, message, data: 'Permintaan tidak valid' })
  }
  const token = req.header('token')
  const decodedToken = jwt.decode(token)
  console.log(JSON.stringify({ decodedToken }))
  if (typeof decodedToken.userid !== 'string') return res.status(403).json({ ok, message, data: 'Permintaan tidak valid' })
  const key = await getToken(decodedToken.userid)
  if (key === '') return res.status(403).json({ ok, message, data: 'Permintaan tidak valid' })
  console.log(JSON.stringify({ key }))

  try {
    const isverify = jwt.verify(token, key)
    req.userid = isverify.userid
  } catch (error) {
    console.error(error)
    return res.status(403).json({ ok, message, data: 'Permintaan tidak valid' })
  }
  return next()
}

export { registerUser, signIn, isValidToken }