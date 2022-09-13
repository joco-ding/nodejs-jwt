import promisePool from "./mydb.js"

const addFilm = async (req, res) => {
  console.log(req.userid)
  const { judul, kategori } = req.body

  let ok = false
  let message = 'Gagal'
  let data = {}

  try {
    const [rows, _] = await promisePool.execute(`INSERT INTO tb_films (judul,kategori) VALUES (?, ?)`, [judul, kategori])
    data = rows
    ok = true
    message = 'Berhasil'
  } catch (error) {
    data = error
  }

  res.json({ ok, message, data })
}

export default addFilm