const fs = require("fs").promises;

/**
 * Gerenciador de Hashes para arquivos e linhas.
 */
class HashManager {
  /**
   * Construtor do HashManager.
   * @param {string} fileHashesPath - O caminho para o arquivo de hashes de arquivos.
   * @param {string} lineHashesPath - O caminho para o arquivo de hashes de linhas.
   */
  constructor(
    fileHashesPath = `${process.env.STORAGE_FILE_HASHES || "/tmp/fileHashes.json"}`,
    lineHashesPath = `${process.env.STORAGE_FILE_HASHES || "/tmp/lineHashes.json"}`,
  ) {
    // Inicializa os conjuntos de fileHashes e lineHashes.
    this.fileHashes = new Set();
    this.lineHashes = new Set();
    // Atribui os caminhos dos arquivos de hashes.
    this.fileHashesPath = fileHashesPath;
    this.lineHashesPath = lineHashesPath;
  }

  /**
   * Carrega os hashes dos arquivos e linhas a partir dos arquivos correspondentes.
   */
  async loadHashes() {
    try {
      // Lê os dados dos hashes de arquivos.
      const fileHashesData = await fs.readFile(this.fileHashesPath, "utf8");
      const fileHashes = JSON.parse(fileHashesData);
      this.fileHashes = new Set(fileHashes);
    } catch (error) {
      // Trata erros ao carregar hashes de arquivos.
      if (error.code !== "ENOENT") {
        // console.error("Erro ao carregar os hashes de arquivos:", error);
      }
    }

    try {
      // Lê os dados dos hashes de linhas.
      const lineHashesData = await fs.readFile(this.lineHashesPath, "utf8");
      const lineHashes = JSON.parse(lineHashesData);
      this.lineHashes = new Set(lineHashes);
    } catch (error) {
      // Trata erros ao carregar hashes de linhas.
      if (error.code !== "ENOENT") {
        // console.error("Erro ao carregar os hashes de linhas:", error);
      }
    }
  }

  /**
   * Salva os hashes de arquivos e linhas nos arquivos correspondentes.
   */
  async saveHashes() {
    try {
      // Converte e escreve os hashes de arquivos no arquivo.
      const fileHashesData = JSON.stringify([...this.fileHashes]);
      await fs.writeFile(this.fileHashesPath, fileHashesData, "utf8");
    } catch (error) {
      // Trata erros ao salvar hashes de arquivos.
      console.error("Erro ao salvar os hashes de arquivos:", error);
    }

    try {
      // Converte e escreve os hashes de linhas no arquivo.
      const lineHashesData = JSON.stringify([...this.lineHashes]);
      await fs.writeFile(this.lineHashesPath, lineHashesData, "utf8");
    } catch (error) {
      // Trata erros ao salvar hashes de linhas.
      console.error("Erro ao salvar os hashes de linhas:", error);
    }
  }

  /**
   * Verifica se um hash de arquivo está presente.
   * @param {string} hash - O hash a ser verificado.
   * @returns {boolean} - true se o hash está presente, senão false.
   */
  hasFileHash(hash) {
    return this.fileHashes.has(hash);
  }

  /**
   * Adiciona um hash de arquivo.
   * @param {string} hash - O hash a ser adicionado.
   */
  addFileHash(hash) {
    this.fileHashes.add(hash);
  }

  /**
   * Verifica se um hash de linha está presente.
   * @param {string} hash - O hash a ser verificado.
   * @returns {boolean} - true se o hash está presente, senão false.
   */
  hasLineHash(hash) {
    return this.lineHashes.has(hash);
  }

  /**
   * Adiciona um hash de linha.
   * @param {string} hash - O hash a ser adicionado.
   */
  addLineHash(hash) {
    this.lineHashes.add(hash);
  }

  /**
   * Adiciona hashes de arquivos e linhas e salva os hashes.
   * @param {Array<string>} newFileHashes - Os novos hashes de arquivos a serem adicionados.
   * @param {Array<string>} newLineHashes - Os novos hashes de linhas a serem adicionados.
   */
  async addHashes(newFileHashes, newLineHashes) {
    // Adiciona os novos hashes de arquivos e linhas.
    newFileHashes.forEach((hash) => this.fileHashes.add(hash));
    newLineHashes.forEach((hash) => this.lineHashes.add(hash));
    // Salva os hashes atualizados.
    await this.saveHashes();
  }
}

module.exports = HashManager;
