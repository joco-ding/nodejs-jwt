import promisePool from "./mydb.js"

const getAllFilm = async (_, res) => {
  let ok = false
  let message = 'Gagal'
  let data = {}

  try {
    const [rows, _] = await promisePool.query(`SELECT * FROM tb_films`)
    data = rows
    ok = true
    message = 'Berhasil'
  } catch (error) {
    data = error
  }

  res.json({ ok, message, data })
}

export default getAllFilm