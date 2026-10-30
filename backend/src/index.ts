import { app } from './app';
import { config } from './config/env';
import { MediaRepository } from './repositories/MediaRepository';
import { MediaScannerService } from './services/MediaScannerService';

const mediaRepository = new MediaRepository();

app.listen(config.port, () => {
  console.log(`[JRFlix Backend] Servidor rodando na porta ${config.port}`);
  console.log(`[JRFlix Backend] Diretório de mídias: ${config.mediaRootPath}`);

  // Run media scanner after server is ready
  new MediaScannerService(mediaRepository).scan().catch(console.error);
});
