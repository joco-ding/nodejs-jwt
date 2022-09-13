import promisePool from "./mydb.js"

const putFilm = async (req, res) => {

  const id = parseInt(req.params.id, 10)
  const { judul, kategori } = req.body

  let ok = false
  let message = 'Gagal'
  let data = {}

  try {
    const [rows, _] = await promisePool.execute(`UPDATE tb_films SET judul=?, kategori=? WHERE id=?`, [judul, kategori, id])
    data = rows
    ok = true
    message = 'Berhasil'
  } catch (error) {
    data = error
  }

  res.json({ ok, message, data })
}

export default putFilm