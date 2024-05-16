const multer = require("multer");
const path = require("path");
const MagaLu = require("../utils/LoggingExtension"); // :-)

/**
 * Define a configuração do armazenamento para o Multer, usado para o processamento de upload de arquivos.
 * Configura a pasta de destino dos arquivos e o formato do nome de arquivo.
 *
 */
const storage = multer.diskStorage({
  /**
   * Define o destino onde os arquivos serão salvos.
   * @param {Object} req - Objeto da requisição do Express.
   * @param {Object} file - Objeto do arquivo que está sendo enviado.
   * @param {Function} cb - Função de callback para definir o destino do arquivo.
   */
  destination: function (req, file, cb) {
    cb(null, `${process.env.UPLOADS_DIR || path.join(__dirname, "uploads")}`); // Caminho do diretório onde os arquivos serão salvos.
  },
  /**
   * Define o nome do arquivo no sistema de armazenamento.
   * @param {Object} req - Objeto da requisição do Express.
   * @param {Object} file - Objeto do arquivo que está sendo enviado.
   * @param {Function} cb - Função de callback para definir o nome do arquivo.
   */
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const filename = `${file.originalname.split(".")[0]}_${timestamp}${path.extname(file.originalname)}`;
    MagaLu.log({ evemt: "diskStorage", filename: filename }); // Log do nome do arquivo para fins de debug.
    cb(null, filename); // Configura o nome do arquivo.
  },
});

/**
 * Configura as variáveis de ambiente carregadas do arquivo .env para os limites de upload.
 * @constant {Object} uploadLimits
 * @property {number} fileSize - O tamanho máximo do arquivo em bytes.
 * @property {number} files - O número máximo de arquivos permitidos.
 */
const uploadLimits = {
  /**
   * O tamanho máximo do arquivo em bytes.
   * @default
   */
  fileSize: parseInt(process.env.FILE_SIZE_LIMIT) || 100 * 1024 * 1024, // Verifica se há um valor definido no .env, caso contrário, usa o valor padrão de 10 MB

  /**
   * O número máximo de arquivos permitidos.
   * @default
   */
  files: parseInt(process.env.FILES_LIMIT) || 10, // Verifica se há um valor definido no .env, caso contrário, usa o valor padrão de 10 arquivos
};

// Configura o Multer com as definições de armazenamento especificadas.
const upload = multer({ storage: storage, limits: uploadLimits });

module.exports = {
  upload,
  storage,
  uploadLimits,
};
