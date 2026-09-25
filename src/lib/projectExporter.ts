import JSZip from 'jszip';

// Import all text source files eagerly as raw text strings
const rawSourceFiles = import.meta.glob(
  [
    '/src/**/*.{ts,tsx,css}',
    '/*.{json,ts,html,toml}',
    '/.gitignore',
    '/.env.example',
    '/public/_redirects'
  ],
  { query: '?raw', eager: true, import: 'default' }
);

export async function generateClientSideSourceZip(
  onProgress?: (msg: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  onProgress?.('Source Code ဖိုင်များ ထည့်သွင်းနေပါသည်...');

  // 1. Add all source text files
  for (const [filePath, content] of Object.entries(rawSourceFiles)) {
    // Strip leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    // Skip node_modules, dist, or other unwanted files if any
    if (cleanPath.startsWith('dist/') || cleanPath.startsWith('node_modules/')) {
      continue;
    }
    zip.file(cleanPath, content as string);
  }

  // 2. Fetch and add the image assets from public/images
  const imageNames = [
    'hero_bangkok_community_1790239728277.jpg',
    'blog_cover_banking_1790239743026.jpg',
    'blog_cover_workpermit_1790239756019.jpg',
    'about_team_assistance_1790239768198.jpg',
  ];

  onProgress?.('ပုံရိပ်များ (Images) ထည့်သွင်းနေပါသည်...');

  for (const imgName of imageNames) {
    try {
      const response = await fetch(`/images/${imgName}`);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        zip.file(`public/images/${imgName}`, arrayBuffer);
        zip.file(`src/assets/images/${imgName}`, arrayBuffer);
      }
    } catch (err) {
      console.warn(`Could not bundle image ${imgName}:`, err);
    }
  }

  onProgress?.('ZIP ဖိုင် ထုပ်ပိုးနေပါသည်...');
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return blob;
}
