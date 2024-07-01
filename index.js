const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios);
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

app.get("/list-files", (req, res) => {
  const basePath = __dirname;

  fs.readdir(basePath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send("Gagal membaca direktori.");
    }

    // Filter out specific files and folders
    const excluded = [
      ".git",
      "index.js",
      "node_modules",
      "package-lock.json",
      "package.json",
    ];
    const fileInfo = files
      .filter((file) => !excluded.includes(file)) // Hapus file dan folder yang tidak diinginkan
      .map((file) => {
        const filePath = path.join(basePath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        return {
          name: file,
          path: filePath, // Menambahkan path folder atau file
          isDirectory: isDirectory,
        };
      });

    // Menambahkan path folder dari index.js ke informasi respons
    const responseInfo = {
      currentPath: basePath, // Menambahkan path folder index.js
      items: fileInfo,
    };

    res.status(200).json(responseInfo);
  });
});

app.get("/download-file", (req, res) => {
  const fileName = req.query.folderName;
  if (!fileName) {
    return res.status(400).send("Nama folder diperlukan.");
  }

  const filePath = path.join(__dirname, fileName, `${fileName}.text`);

  console.log(filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File tidak ditemukan.");
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      return res.status(500).send("Gagal mengunduh file.");
    }
    // Logging untuk memastikan file berhasil diunduh
    console.log(`File ${fileName}.text berhasil diunduh.`);
  });
});

app.get("/keep-alive", (req, res) => {
  res.status(200).send("OK");
});

function sendKeepAlive() {
  const url = `https://test-render-folder.onrender.com/keep-alive`; // Sesuaikan dengan URL server Anda
  axios
    .get(url)
    .then((response) => {
      console.log("Keep-alive response:", response.data);
    })
    .catch((error) => {
      console.error("Error sending keep-alive:", error);
    });
}

// Kirim keep-alive setiap 30 menit
setInterval(sendKeepAlive, 30 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
