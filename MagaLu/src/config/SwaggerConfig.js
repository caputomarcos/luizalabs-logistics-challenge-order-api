const swaggerJsdoc = require("swagger-jsdoc");
const packageInfo = require("../../package.json"); // Adjust the path as necessary

/**
 * Configuração do Swagger para documentação da API.
 * Utiliza o Swagger UI para proporcionar uma interface de documentação interativa.
 *
 */
const options = {
  definition: {
    openapi: "3.0.0", // Versão do OpenAPI usada na documentação.
    info: {
      title: packageInfo.title || "LuizaLabs Logistics Challenge ORDER-API",
      version: packageInfo.version,
      description:
        packageInfo.description ||
        "API para o desafio de integração logística da LuizaLab",
    },
    servers: [
      {
        url: `${process.env.API_SERVER_URL || "http://localhost:6868"}/api`, // URL do servidor de desenvolvimento.
        description: `${process.env.NODE_ENV || "production"} server`, // Descrição do servidor.
      },
    ],
  },
  apis: ["./src/api/Routes.js"], // Arquivos que contêm anotações para documentação do Swagger.
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerSpec, options };
