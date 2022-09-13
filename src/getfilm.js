import promisePool from "./mydb.js"

const getFilm = async (req, res) => {
  const id = parseInt(req.params.id, 10)
  let ok = false
  let message = 'Gagal'
  let data = {}

  try {
    const [rows, _] = await promisePool.query(`SELECT * FROM tb_films WHERE id=?`, [id])
    data = rows
    ok = true
    message = 'Berhasil'
  } catch (error) {
    data = error
  }

  res.json({ ok, message, data })
}

export default getFilm