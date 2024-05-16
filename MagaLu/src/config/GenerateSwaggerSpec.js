/**
 * Gera a especificação Swagger para documentação da API.
 */

const swaggerJsdoc = require("swagger-jsdoc"); // Importa a biblioteca swagger-jsdoc para gerar a especificação Swagger.
const fs = require("fs"); // Importa o módulo fs para lidar com operações de arquivo.
const path = require("path"); // Importa o módulo path para lidar com caminhos de arquivos.
const { options } = require("./SwaggerConfig"); // Importa as opções de configuração da documentação do Swagger.

// Gera a especificação Swagger com base nas opções fornecidas.
const swaggerSpec = swaggerJsdoc(options);

// Define o caminho de saída para o arquivo de especificação Swagger.
const outputPath = path.join(__dirname, "../../public", "swagger.json");

// Escreve a especificação Swagger em um arquivo JSON no caminho de saída definido.
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2), "utf-8");

// Exibe uma mensagem indicando que a especificação Swagger foi gerada com sucesso no caminho especificado.
console.log("A especificação do Swagger foi gerada em", outputPath);
