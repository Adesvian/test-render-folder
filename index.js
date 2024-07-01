const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/create", (req, res) => {
  const folderName = req.query.folderName;
  const content = req.query.content;

  // Tentukan path folder baru
  const newFolderPath = path.join(__dirname, folderName);

  // Periksa apakah folder sudah ada
  if (fs.existsSync(newFolderPath)) {
    return res.status(400).send("Folder sudah ada.");
  }

  // Buat folder baru
  fs.mkdir(newFolderPath, { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating folder:", err);
      return res.status(500).send("Gagal membuat folder.");
    }
    // buat file .text dengan isi content
    fs.writeFile(`${newFolderPath}/${folderName}.text`, content, (err) => {
      if (err) {
        console.error("Error creating file:", err);
        return res.status(500).send("Gagal membuat file.");
      }
    });
    res.status(200).send(`Folder ${folderName} berhasil dibuat.`);
  });
});

app.get("/delete", (req, res) => {
  const folderName = req.query.folderName;

  // Tentukan path folder
  const folderPath = path.join(__dirname, folderName);

  // Periksa apakah folder ada
  if (!fs.existsSync(folderPath)) {
    return res.status(400).send("Folder tidak ada.");
  }

  // Hapus folder
  fs.rm(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error("Error deleting folder:", err);
      return res.status(500).send("Gagal menghapus folder.");
    }
    res.status(200).send(`Folder ${folderName} berhasil dihapus.`);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
