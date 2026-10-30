import fs from 'fs';
import path from 'path';
import { IMediaRepository } from '../repositories/MediaRepository';
import { config } from '../config/env';

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.webm', '.mov', '.avi'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

interface ParsedEpisodeInfo {
  season: number;
  episode: number;
  title: string;
}

/**
 * Slugify a string for use as a seriesSlug.
 * Keeps letters, digits, hyphens; lowercases everything.
 */
function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Clean up a raw filename into a readable title.
 * Replaces dots and underscores with spaces, trims resolution patterns.
 */
function cleanTitle(raw: string): string {
  return raw
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b(1080p|720p|480p|4K|x264|x265|BluRay|WEB-DL|HDTV|HEVC)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Parse SxxExx pattern from a filename to extract season/episode numbers and title.
 * E.g. "Avatar.Os.Sete.Refugios.S01E04.mp4" → { season: 1, episode: 4, title: "Avatar Os Sete Refugios" }
 */
function parseEpisodeInfo(fileName: string): ParsedEpisodeInfo {
  const nameWithoutExt = path.basename(fileName, path.extname(fileName));
  const seMatch = nameWithoutExt.match(/^(.*?)[\s._]?[Ss](\d{1,2})[Ee](\d{1,3})(.*)?$/);

  if (seMatch) {
    const rawTitle = seMatch[1];
    const season = parseInt(seMatch[2], 10);
    const episode = parseInt(seMatch[3], 10);
    const title = cleanTitle(rawTitle) || cleanTitle(nameWithoutExt);
    return { season, episode, title };
  }

  // No SxxExx pattern — use index-based numbering
  return { season: 1, episode: 0, title: cleanTitle(nameWithoutExt) };
}

/**
 * Try to extract a 4-digit year from a filename.
 */
function extractYear(name: string): number {
  const match = name.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
}

export class MediaScannerService {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  public async scan(): Promise<void> {
    const mediaRoot = config.mediaRootPath;

    if (!fs.existsSync(mediaRoot)) {
      console.warn(`[Scanner] Diretório de mídias não encontrado: ${mediaRoot}`);
      return;
    }

    console.log(`[Scanner] Iniciando varredura em: ${mediaRoot}`);

    const entries = fs.readdirSync(mediaRoot, { withFileTypes: true });

    for (const entry of entries) {
      try {
        if (entry.isDirectory()) {
          await this.processDirectory(mediaRoot, entry.name);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (VIDEO_EXTENSIONS.includes(ext)) {
            await this.processMovieFile(mediaRoot, entry.name);
          }
        }
      } catch (err) {
        console.error(`[Scanner] Erro ao processar "${entry.name}":`, err);
      }
    }

    console.log('[Scanner] Varredura concluída.');
  }

  private async processDirectory(mediaRoot: string, dirName: string): Promise<void> {
    const dirPath = path.join(mediaRoot, dirName);
    const dirEntries = fs.readdirSync(dirPath, { withFileTypes: true });

    const videoFiles = dirEntries
      .filter(
        (e) => e.isFile() && VIDEO_EXTENSIONS.includes(path.extname(e.name).toLowerCase())
      )
      .map((e) => e.name)
      .sort(); // alphabetical order

    if (videoFiles.length === 0) {
      return; // No videos → skip
    }

    const imageFile = dirEntries.find(
      (e) => e.isFile() && IMAGE_EXTENSIONS.includes(path.extname(e.name).toLowerCase())
    );

    const title = dirName;
    const seriesSlug = slugify(dirName);
    // Store cover as relative subfolder path so MediaService can resolve it
    const coverUrl = imageFile
      ? `${dirName}/${imageFile.name}`
      : '';

    // Upsert the series Media record
    const media = await this.mediaRepository.upsertMedia({
      title,
      description: 'Importado automaticamente do diretório de mídias.',
      type: 'SERIES',
      filePath: dirName,        // series "file path" = folder name
      coverUrl,
      year: new Date().getFullYear(),
      seriesSlug
    });

    console.log(`[Scanner] Série: "${title}" (${videoFiles.length} episódios)`);

    // Upsert episodes
    for (let i = 0; i < videoFiles.length; i++) {
      const fileName = videoFiles[i];
      const info = parseEpisodeInfo(fileName);
      const episodeNumber = info.episode > 0 ? info.episode : i + 1;
      const filePath = `${dirName}/${fileName}`;

      await this.mediaRepository.upsertEpisode({
        filePath,
        title: info.title || fileName,
        episodeNumber,
        seasonNumber: info.season,
        mediaId: media.id
      });

      console.log(`[Scanner]   → S${String(info.season).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')} "${info.title}"`);
    }
  }

  private async processMovieFile(mediaRoot: string, fileName: string): Promise<void> {
    const nameWithoutExt = path.basename(fileName, path.extname(fileName));
    const title = cleanTitle(nameWithoutExt);
    const year = extractYear(nameWithoutExt);

    // Look for cover: image with same base name in the same directory
    const coverUrl = this.findCoverForMovie(mediaRoot, nameWithoutExt);

    await this.mediaRepository.upsertMedia({
      title,
      description: 'Importado automaticamente do diretório de mídias.',
      type: 'MOVIE',
      filePath: fileName,
      coverUrl,
      year
    });

    console.log(`[Scanner] Filme: "${title}" (${year})`);
  }

  private findCoverForMovie(mediaRoot: string, baseName: string): string {
    for (const ext of IMAGE_EXTENSIONS) {
      // Try exact match
      const candidate = path.join(mediaRoot, `${baseName}${ext}`);
      if (fs.existsSync(candidate)) {
        return `${baseName}${ext}`;
      }
      // Try lowercased base name
      const candidateLower = path.join(mediaRoot, `${baseName.toLowerCase()}${ext}`);
      if (fs.existsSync(candidateLower)) {
        return `${baseName.toLowerCase()}${ext}`;
      }
    }
    return '';
  }
}
