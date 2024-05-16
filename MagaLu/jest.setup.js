// jest.setup.js
jest.setTimeout(30000); // aumenta o timeout dos testes se necessário

const fs = require("fs");
const path = require("path");

// Função para limpar a pasta de uploads após cada teste
afterEach(() => {
  const directory = path.join(__dirname, "uploads");
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
});
