import { IMGSIZE, MIMETYPE, THUMBSIZE, UPLOADPATH, URLHOST } from "./config.js"
import { v4 as uuidv4 } from 'uuid'
import { createReadStream, createWriteStream, existsSync, unlinkSync } from "fs"
import sharp from 'sharp'

const resizeGambar = async (dari, ke, width, height) => {
  try {

    const inStream = createReadStream(dari)
    const outStream = createWriteStream(ke)
    const transform = sharp().resize({ width, height })

    inStream.pipe(transform).pipe(outStream)

    if (!existsSync(ke)) return false

  } catch (error) {
    console.error(error)
    return false
  }
  return true
}


const uploadgambar = async (req, res) => {

  let ok = false
  let message = 'Gagal'
  let data = {}

  try {
    if (!req.files) {
      message = 'File gambar harus disertakan'
      res.status(400).json({ ok, message, data })
      return
    }
    const gambar = req.files.gambar
    if (!MIMETYPE.includes(gambar.mimetype)) {
      message = 'File harus berupa gambar dengan ektensi yang sudah ditentukan'
      res.status(400).json({ ok, message, data })
      return
    }
    let ekstensi = 'jpg'
    switch (gambar.mimetype) {
      case 'image/gif':
        ekstensi = 'gif'
        break;
      case 'image/png':
        ekstensi = 'png'
        break;
    }
    let lokasigambarasli = ''
    let lokasigambar = ''
    let lokasithumbnail = ''
    let urlgambar = ''
    let urlthumb = ''
    while (true) {
      const uuid = uuidv4()
      lokasigambarasli = `${UPLOADPATH}/orig-` + uuid + `.${ekstensi}`

      lokasigambar = `${UPLOADPATH}/` + uuid + `.${ekstensi}`
      lokasithumbnail = `${UPLOADPATH}/thumb-` + uuid + `.${ekstensi}`
      urlgambar = `${URLHOST}/` + uuid + `.${ekstensi}`
      urlthumb = `${URLHOST}/thumb-` + uuid + `.${ekstensi}`

      if (!existsSync(lokasigambar)) break
    }

    await gambar.mv(lokasigambarasli)

    if (!existsSync(lokasigambarasli)) {
      message = 'Terdapat Kesalahan. File tidak dapat disimpan'
      res.status(400).json({ ok, message, data })
      return
    }

    if (resizeGambar(lokasigambarasli, lokasigambar, IMGSIZE[0], IMGSIZE[1]) === false) {
      message = 'Terdapat Kesalahan. Gambar gagal dibuat tidak dapat disimpan'
      res.status(400).json({ ok, message, data })
      return
    }

    if (resizeGambar(lokasigambarasli, lokasithumbnail, THUMBSIZE[0], THUMBSIZE[1]) === false) {
      message = 'Terdapat Kesalahan. Thumbnail gagal dibuat tidak dapat disimpan'
      res.status(400).json({ ok, message, data })
      return
    }
    
    if (!existsSync(lokasigambarasli))
      unlinkSync(lokasigambarasli)

    ok = true
    message = 'Gambar berhasil diupload'
    data = {
      gambar: urlgambar,
      thumbnail: urlthumb
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok, message: 'Terdapat kesalahan', data: error })
    return
  }
  res.json({ ok, message, data })
}

export default uploadgambar
