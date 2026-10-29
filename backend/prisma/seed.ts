import { PrismaClient, MediaType } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Seeding initial media data...');

  await prisma.media.deleteMany();

  await prisma.media.createMany({
    data: [
      {
        title: 'Sintel - The Open Movie Project',
        description: 'Uma jovem guerreira chamada Sintel procura por seu pequeno dragão de estimação Scales em um mundo de fantasia épico.',
        type: MediaType.MOVIE,
        filePath: 'sintel.mp4',
        coverUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
        year: 2010
      },
      {
        title: 'Cosmos & Nature',
        description: 'Série documental explorando as maravilhas ocultas das florestas tropicais e a vastidão do universo.',
        type: MediaType.SERIES,
        filePath: 'cosmos_sample.mp4',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        year: 2023
      },
      {
        title: 'Big Buck Bunny',
        description: 'A clássica animação open source sobre um coelho gigante e simpático que resolve dar uma lição nos roedores travessos da floresta.',
        type: MediaType.MOVIE,
        filePath: 'big_buck_bunny.mp4',
        coverUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80',
        year: 2008
      }
    ]
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

