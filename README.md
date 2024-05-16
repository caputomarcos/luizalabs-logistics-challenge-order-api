# LuizaLabs Logistics Challenge ORDER-API (1.0.0)

Este projeto é uma implementação para o desafio técnico da LuizaLabs/Vertical Logística. O principal objetivo é transformar dados de pedidos desnormalizados de um sistema legado em um formato JSON normalizado, acessível via uma API REST.

## Motivação

Este projeto visa não apenas atender aos requisitos funcionais, mas também garantir a integridade dos dados, prevenir duplicidade e fornecer uma solução escalável e eficiente. A solução proposta busca maximizar a eficiência do processamento de dados e garantir uma armazenagem segura, utilizando técnicas como hashing para controle de duplicidade e armazenamento no MongoDB para persistência robusta.

## Arquitetura do Sistema

A arquitetura deste projeto foi concebida para otimizar o processamento e armazenamento de dados de pedidos, utilizando:

- **Processamento em Memória:** para rápido processamento e transformação de dados.
- **MongoDB:** para persistência de dados processados.
- **Hash de Linha e de Arquivo:** para garantir a integridade e evitar duplicações no processamento de arquivos.

### Diagramas de Arquitetura

#### Diagrama de Sequência
```mermaid
sequenceDiagram
    participant Cliente as Cliente
    participant API as API
    participant Memória as Memória
    participant MongoDB as MongoDB Persistente
    participant ArquivoHash as Arquivo de HASH Persistente

    rect rgb(139, 84, 139)
    API->>+ArquivoHash: Carregar HASH de Arquivo/Linha ao Inicializar Serviço
    end
    ArquivoHash->>Memória: Carregar em Memória HASH de Arquivo/Linha
    rect rgb(139, 84, 139)
    Cliente->>+API: Faz Upload de Arquivo desnormalizado
    end
    loop Normalizar e Processar
        Memória->>Memória: Verificar Duplicidade de HASH de Arquivo
        Memória->>Memória: Verificar Duplicidade de Linha,<br/>Processar e Gerar HASH do arquivo/linha
    end
    rect rgb(139, 84, 139)
    Memória->>API: Retornar Arquivo Normalizado JSON
    API-->>-Cliente: Confirmação de Recebimento
    end
    rect rgb(0, 102, 176)
    Memória->>+MongoDB: Salvar Dados Processados
    end
    rect rgb(153, 144, 0)
    Memória->>+ArquivoHash: Salvar HASH de Arquivo/Linha
    end
```

#### Diagrama de Fluxo
```mermaid
graph TD
    A[Início] -->|Faz Upload de Arquivo| B[API]
    B -->|Carregar HASH de Arquivo/Linha ao Inicializar Serviço| C[Arquivo de HASH Persistente]
    C -->|Carregar em Memória HASH de Arquivo/Linha| D[Memória]
    D --> E{Processamento em Memória}
    E -->|Verificar Duplicidade de HASH| F[Checa Duplicidade]
    F -->|Não Duplicado| G[Processa e Gera HASH]
    F -->|Duplicado| H[Término]
    G -->|Salva Pedidos Gerados| I[Salva Dados Processados]
    G -->|Salva Hash de Arquivo/Linha| J[Salva HASH]
    G --> |Retorna JSON|M[Fim]
    I -->|MongoDB Externo| K[Armazenamento de Dados no MongoDB Persistente]
    J -->|Armazenamento Externo| L[Armazenamento de HASH em Disco Persistente]

    style B fill:#8b548b,stroke:#333,stroke-width:2px
    style H fill:#8b548b,stroke:#333,stroke-width:2px
    style I fill:#0066b0,stroke:#333,stroke-width:2px,stroke-dasharray: 15 5
    style J fill:#999000,stroke:#333,stroke-width:2px,stroke-dasharray: 15 5
    style K fill:#0066b0,stroke:#333,stroke-width:2px
    style L fill:#999000,stroke:#333,stroke-width:2px
    style M fill:#8b548b,stroke:#333,stroke-width:2px
    style A font-weight:bold, font-color:black
    style B font-weight:bold, font-color:black
    style C font-weight:bold, font-color:black
    style D font-weight:bold, font-color:black
    style E font-weight:bold, font-color:black
    style F font-weight:bold, font-color:black
    style G font-weight:bold, font-color:black
    style H font-weight:bold, font-color:black
    style I font-weight:bold, font-color:black
    style J font-weight:bold, font-color:black
    style K font-weight:bold, font-color:black
    style L font-weight:bold, font-color:black
    style M font-weight:bold, font-color:black
```

## Funcionalidades Principais

- **Upload e Processamento de Arquivos:** permite o upload de arquivos e processa esses dados em memória.
- **Consulta de Pedidos:** filtros por ID do pedido e intervalos de datas.
- **Streaming de Pedidos:** streaming de dados de pedidos em tempo real.

## Tecnologias Utilizadas

- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **Multer**
- **Crypto** (para geração de hashes)
- **fs** (manipulação de arquivos)

## Configuração e Execução

### Pré-requisitos

- Node.js instalado
- MongoDB operacional localmente ou em um servidor remoto
- Variáveis de ambiente configuradas conforme descrito no arquivo `.env`

### Execução

- **Localmente**:
  ```bash
  npm install
  npm start
  ```

- **Usando Docker**:
  ```bash
  docker-compose up
  ```
Após iniciar a aplicação, você pode acessar o dashboard no seguinte endereço:

- **Dashboard:** [http://localhost:6868/](http://localhost:6868/)
  
  ![Dashboard](https://github.com/caputomarcos/luizalabs-logistics-challenge-order-api/assets/3945941/bc67399c-29cf-4a8e-89f0-f27d78863477)


## Exemplos de Chamadas API

🔗 **Baixe a coleção do Postman para o projeto ORDER-API aqui:**
[LuizaLabs ORDER-API Postman Collection](https://raw.githubusercontent.com/caputomarcos/luizalabs-logistics-challenge-order-api/main/luizalabs-logistics-challenge-order-api.postman_collection.json)

### Carregar Múltiplos Arquivos

```bash
curl -X POST http://localhost:6868/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data_1.txt" \
  -F "file=@data_2.txt"
```

### Obter Pedidos da Memória

```bash
curl -X GET http://localhost:6868/api/memory/orders
```

### Obter Pedidos da Memória com Filtros

```bash
curl -X GET "http://localhost:6868/api/memory/orders?userId=85&orderId=909"
```

### Obter Pedidos do MongoDB com Filtros

```bash
curl -X GET "http://localhost:6868/api/database/orders?userId=1000000200&orderId=1839"
```

### Transmitir Pedidos em Tempo Real

```bash
curl -X GET http://localhost:6868/api/stream-orders
```

## Documentação da API

### Swagger UI
A interface do Swagger UI para interação com a documentação da API está disponível nos seguintes endereços após iniciar a aplicação:
- **Swagger UI:** [http://localhost:6868/api/swagger/](http://localhost:6868/api/swagger/)
- **API Docs:** [http://localhost:6868/api/api-docs](http://localhost:6868/api/api-docs)

### Documentação Adicional para Desenvolvimento (Apenas em Modo de Desenvolvimento)
- **Documentos de Desenvolvimento:** [http://localhost:6868/dev-docs](http://localhost:6868/dev-docs) - Documentação adicional para desenvolvedores.
- **Relatórios de Testes:** [http://localhost:6868/test-docs](http://localhost:6868/test-docs) - Relatórios de cobertura de testes.

Essas rotas são configuradas para facilitar o acesso a informações cruciais durante o desenvolvimento e a manutenção da aplicação.

## Contribuição

Sinta-se à vontade para contribuir com este projeto através de pull requests. Por favor, siga as diretrizes de contribuição e o código de conduta.
