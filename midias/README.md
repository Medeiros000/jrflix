# Pasta de Mídias Locais

Coloque seus arquivos de vídeo (como `.mp4`, `.mkv`, `.webm`) e as imagens
de capa (como `.jpg`, `.png` ou `.webp`) nesta pasta.

Eles serão montados automaticamente dentro do container do backend em `/app/media`.

No banco de dados, salve em `coverUrl` somente o nome do arquivo de imagem,
por exemplo `frozen.jpg`. A rota `GET /api/media` lerá essa imagem e a
enviará incorporada no campo `coverUrl` da resposta do catálogo.

Exemplo:
- vídeo: `Frozen.mp4`
- capa: `frozen.jpg`
