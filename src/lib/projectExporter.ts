// Bundle source files eagerly as raw strings so no dynamic HTTP fetch is blocked by Vite dev server
const rawSourceFiles = import.meta.glob<string>(
  [
    '/src/**/*',
    '!/src/assets/images/**',
    '/*.{json,ts,js,html,toml,md,lock}',
  ],
  { query: '?raw', eager: true, import: 'default' }
);

const GITIGNORE_CONTENT = `# Dependencies
node_modules/
/.pnp
.pnp.js

# Production build output (Netlify will generate this automatically via 'npm run build')
dist/
dist-ssr/
build/
out/

# Environment files containing secrets or local keys (NEVER commit secrets to GitHub)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Allow committing template env file for reference
!.env.example

# Logs & debugging
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
*.log

# Editor & OS files
.DS_Store
Thumbs.db
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Vite & build tool cache
.vite/
coverage/
*.local

# Local package archives
*.zip
`;

const ENV_EXAMPLE_CONTENT = `# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"

# Supabase Cloud Database & Storage (Required for cross-device Blog & Cover image persistence)
# Add these 2 variables to your Netlify Site configuration > Environment variables:
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
`;

const PUBLIC_REDIRECTS_CONTENT = `/src/assets/images/*  /images/:splat  200
/*                    /index.html     200
`;

const PUBLIC_ROBOTS_CONTENT = `# robots.txt for Solution for You - အဖြေက ဒီမှာပါ
User-agent: *
Allow: /
Disallow: /admin
Disallow: /#/admin
`;

const README_CONTENT = `# solution4u
`;

export const REQUIRED_ZIP_FILES = [
  'src/pages/LegalPages.tsx',
  'src/components/admin/LegalPagesEditor.tsx',
  'src/lib/projectExporter.ts',
  'src/types.ts',
  'src/context/AppContext.tsx',
  'src/pages/AdminPage.tsx',
  'README.md',
  '.gitignore',
  '.env.example',
  'bun.lock',
  'package.json',
  'package-lock.json',
  'netlify.toml',
  'public/_redirects',
  'public/robots.txt',
];

export async function generateClientSideSourceZip(
  onProgress?: (msg: string) => void,
  extraFiles?: Record<string, string>
): Promise<{ blob: Blob; fileCount: number; verifiedFiles: string[] }> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  onProgress?.('Source Code ဖိုင်များ ထည့်သွင်းနေပါသည်...');

  const combinedFiles: Record<string, string> = {
    ...rawSourceFiles,
    ...(extraFiles || {}),
  };

  // 1. Add all source & config text files from memory
  for (const [filePath, content] of Object.entries(combinedFiles)) {
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    if (
      cleanPath.startsWith('dist/') ||
      cleanPath.startsWith('node_modules/') ||
      cleanPath.startsWith('.git/') ||
      cleanPath.startsWith('.vite/') ||
      cleanPath.endsWith('.zip') ||
      cleanPath === 'package_project.py' ||
      (cleanPath.startsWith('.env') && cleanPath !== '.env.example')
    ) {
      continue;
    }
    if (typeof content === 'string') {
      zip.file(cleanPath, content);
    }
  }

  // 2. Add dotfiles & public config files directly (avoids Vite server.fs.deny on .env.example)
  zip.file('.gitignore', GITIGNORE_CONTENT);
  zip.file('.env.example', ENV_EXAMPLE_CONTENT);
  zip.file('public/_redirects', PUBLIC_REDIRECTS_CONTENT);
  zip.file('public/robots.txt', PUBLIC_ROBOTS_CONTENT);
  if (!zip.file('README.md')) {
    zip.file('README.md', README_CONTENT);
  }

  // 3. Fetch and add the image assets from public/images (with fallback to /src/assets/images)
  const imageNames = [
    'hero_bangkok_community_1790239728277.jpg',
    'blog_cover_banking_1790239743026.jpg',
    'blog_cover_workpermit_1790239756019.jpg',
    'about_team_assistance_1790239768198.jpg',
  ];

  onProgress?.('ပုံရိပ်များ (Images) ထည့်သွင်းနေပါသည်...');

  for (const imgName of imageNames) {
    try {
      let response = await fetch(`/images/${imgName}`);
      if (!response.ok) {
        response = await fetch(`/src/assets/images/${imgName}`);
      }
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        zip.file(`public/images/${imgName}`, arrayBuffer);
        zip.file(`src/assets/images/${imgName}`, arrayBuffer);
      }
    } catch (err) {
      console.warn(`Could not bundle image ${imgName}:`, err);
    }
  }

  // 4. Internal Verification before generating ZIP Blob
  onProgress?.('ZIP ဖိုင်အတွင်း အရေးကြီးဖိုင်များ စစ်ဆေးနေပါသည်...');
  const allZipPaths = Object.keys(zip.files).filter((k) => !zip.files[k].dir);
  const missingRequired = REQUIRED_ZIP_FILES.filter((reqPath) => !zip.file(reqPath));

  if (missingRequired.length > 0) {
    throw new Error(
      `ZIP Verification Failed — Missing required file(s): ${missingRequired.join(', ')}`
    );
  }

  onProgress?.('ZIP ဖိုင် ထုပ်ပိုးနေပါသည်...');
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return {
    blob,
    fileCount: allZipPaths.length,
    verifiedFiles: allZipPaths.sort(),
  };
}
