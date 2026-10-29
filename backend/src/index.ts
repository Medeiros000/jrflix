import { app } from './app';
import { config } from './config/env';

app.listen(config.port, () => {
  console.log(`[JRFlix Backend] Servidor rodando na porta ${config.port}`);
  console.log(`[JRFlix Backend] Diretório de mídias: ${config.mediaRootPath}`);
});

