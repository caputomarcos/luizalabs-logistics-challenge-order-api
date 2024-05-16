// Initialize dotenv configuration
require("dotenv").config();

// Import dependencies
const express = require("express");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./src/config/SwaggerConfig");

// Import modules
const routes = require("./src/api/Routes");
const loggingMiddleware = require("./src/middlewares/LoggingMiddleware");
const magaLog = require("./src/utils/LoggingExtension");
const { initHashManagers } = require("./src/services/OrderProcessingService");
const connectDB = require("./src/config/Database");

// Initialize the express application
const app = express();

// Middleware para interpretar JSON
app.use(express.json());

// Configuração do Logger com base no ambiente
if (process.env.NODE_ENV === "development") {
  // Utiliza o logger "tiny" no ambiente de desenvolvimento
  app.use(morgan("tiny"));
  // Adiciona middleware de logging
  app.use(loggingMiddleware);
} else {
  // Utiliza o logger "combined" em outros ambientes
  app.use(morgan("combined"));
}

// Middleware para servir arquivos estáticos da pasta public
app.use(express.static("public"));

// Configuração do CORS
const cors = require("cors");
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Rota principal para exibir a página inicial
app.get("/", (req, res) => {
  // Envia um caractere de keep-alive a cada 20 segundos para manter a conexão
  setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 20000); // a cada 20 segundos
  // Envia o arquivo index.html localizado na pasta public
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota principal para as APIs
app.use("/api", routes);

// Rota para servir a interface do Swagger
app.use("/api/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota para servir a documentação das APIs
app.use("/api/api-docs", express.static("public/api-docs.html"));

if (process.env.NODE_ENV === "development") {
  // Servir arquivos estáticos da pasta reports
  app.use(express.static("reports"));
  // Servir arquivos estáticos da pasta reports/dev-docs para /dev-docs
  app.use("/dev-docs", express.static("reports/dev-docs"));
  // Servir arquivos estáticos da pasta reports/coverage/lcov-report para /test-docs
  app.use("/test-docs", express.static("reports/coverage/lcov-report"));
}

const PORT = process.env.NODE_DOCKER_PORT || 8080; // Porta do servidor, usa a porta definida nas variáveis de ambiente ou padrão 8080

initHashManagers()
  .then(() => {
    // Inicializa o servidor e conecta ao banco de dados
    const server = app.listen(PORT, () => {
      connectDB();
      // Registra a mensagem informando a URL do servidor
      magaLog.log(`Servidor rodando em http://localhost:${PORT}`);
    });

    // Aumenta o tempo limite de requisição para 10 minutos
    server.timeout = 600000; // 10 minutos

    // Trata o sinal de encerramento do processo
    process.on("SIGTERM", () => {
      // Registra a mensagem de encerramento do processo
      magaLog.log("Processo encerrando...");

      server.close(() => {
        // Registra o fechamento do servidor HTTP
        magaLog.log("Servidor HTTP fechado.");
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    // Registra o erro ao inicializar os gerenciadores de hash
    magaLog.error("Erro ao inicializar os gerenciadores de hash:", error);
  });

module.exports = app;
