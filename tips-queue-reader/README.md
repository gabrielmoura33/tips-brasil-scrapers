# Tips  Brasil Scrapper

src/
│
├── common/
│   ├── interfaces/
│   │   └── scraper.interface.ts   # Interface para os scrapers
│   ├── utils/
│   │   └── puppeteer.util.ts      # Utilitário para inicializar Puppeteer e gerenciar sessões
│   └── constants/
│       └── scraper.constants.ts   # Constantes para o scraping
│
├── scraping/
│   ├── newspaper/
│   │   ├── dtos/
│   │   │   └── create-newspaper.dto.ts  # DTO para dados de scraping específicos de jornais
│   │   ├── services/
│   │   │   └── scraper.service.ts       # Serviço principal de scraping
│   │   └── scrapers/
│   │       ├── generic.scraper.ts       # Classe genérica de scraping
│   │       └── folha.scraper.ts          # Scraper específico para a Folha de SP
│   │       └── globo.scraper.ts          # Scraper específico para o Globo
│   │       └── estadao.scraper.ts        # Scraper específico para o Estadão
│   │
│   └── scraping.module.ts               # Módulo de scraping
│
└── main.ts                              # Arquivo de inicialização do NestJS
