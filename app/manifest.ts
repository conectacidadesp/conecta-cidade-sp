import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Conecta Cidade SP',
    short_name: 'Conecta SP',
    description: 'Classificados, lojas e serviços da sua cidade',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#0F4C81',
    icons: [
      {
        src: 'https://ahiyxrdplhecskzoiogd.supabase.co/storage/v1/object/public/site-assets/Logo%20redonda.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://ahiyxrdplhecskzoiogd.supabase.co/storage/v1/object/public/site-assets/Logo%20redonda.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}