const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/create", (req, res) => {
  const folderName = req.query.folderName;
  const content = req.query.content;

  const newFolderPath = path.join(__dirname, folderName);

  if (fs.existsSync(newFolderPath)) {
    return res.status(400).send("Folder sudah ada.");
  }

  fs.mkdir(newFolderPath, { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating folder:", err);
      return res.status(500).send("Gagal membuat folder.");
    }

    fs.writeFile(`${newFolderPath}/${folderName}.text`, content, (err) => {
      if (err) {
        console.error("Error creating file:", err);
        return res.status(500).send("Gagal membuat file.");
      }
      res.status(200).send(`Folder ${folderName} berhasil dibuat.`);
    });
  });
});

app.get("/delete", (req, res) => {
  const folderName = req.query.folderName;
  const folderPath = path.join(__dirname, folderName);

  if (!fs.existsSync(folderPath)) {
    return res.status(400).send("Folder tidak ada.");
  }

  fs.rm(folderPath, { recursive: true }, (err) => {
    if (err) {
      console.error("Error deleting folder:", err);
      return res.status(500).send("Gagal menghapus folder.");
    }
    res.status(200).send(`Folder ${folderName} berhasil dihapus.`);
  });
});

app.get('/list-files', (req, res) => {
  const startTime = Date.now();
  const basePath = __dirname;

  fs.readdir(basePath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).send('Gagal membaca direktori.');
    }

    const excluded = [
      '.git',
      'index.js',
      'node_modules',
      'package-lock.json',
      'package.json',
    ];
    const fileInfo = files
      .filter((file) => !excluded.includes(file))
      .map((file) => {
        const filePath = path.join(basePath, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        return {
          name: file,
          path: filePath,
          isDirectory: isDirectory,
        };
      });

    const responseInfo = {
      currentPath: basePath,
      items: fileInfo,
    };

    res.status(200).json(responseInfo);

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Request to /list-files took ${duration}ms`);
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
    console.log(`File ${fileName}.text berhasil diunduh.`);
  });
});

app.get("/keep-alive", (req, res) => {
  res.status(200).send("OK");
});

function sendKeepAlive() {
  const url = `https://test-render-folder.onrender.com/keep-alive`;
  axios
    .get(url)
    .then((response) => {
      console.log("Keep-alive response:", response.data);
    })
    .catch((error) => {
      console.error("Error sending keep-alive:", error);
    });
}

app.get("/read-file", (req, res) => {
  const fileName = req.query.folderName;
  if (!fileName) {
    return res.status(400).send("Nama folder diperlukan.");
  }

  const filePath = path.join(__dirname, fileName, `${fileName}.text`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File tidak ditemukan.");
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Gagal membaca file.");
    }

    res.status(200).json({ content: data });
  });
});

setInterval(sendKeepAlive, 14 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
