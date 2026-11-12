import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gemini SDK on the server
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Hosting & Domain Status API
app.get('/api/hosting-info', (req, res) => {
  const currentAppUrl = process.env.APP_URL || 'https://ais-pre-ghkpnzhmupkvt5gdyacfil-724196993353.asia-northeast1.run.app';
  const devAppUrl = 'https://ais-dev-ghkpnzhmupkvt5gdyacfil-724196993353.asia-northeast1.run.app';
  
  res.json({
    status: 'ONLINE',
    platform: 'Google Cloud Run / AI Studio Public Web',
    region: 'asia-northeast1 (Tokyo)',
    liveSharedUrl: currentAppUrl,
    devUrl: devAppUrl,
    sslEnabled: true,
    protocol: 'HTTPS/2',
    canonicalHost: new URL(currentAppUrl).hostname,
    defaultPort: 443,
    appTitle: 'Edublox City By Sitty - Informatika Kelas VIII',
    uptime: process.uptime(),
  });
});

// 2. DNS & Custom Domain Resolution Check
app.post('/api/check-domain', (req, res) => {
  const { customDomain } = req.body;
  if (!customDomain || typeof customDomain !== 'string') {
    return res.status(400).json({ error: 'Domain wajib diisi' });
  }

  const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const targetHost = 'ghkpnzhmupkvt5gdyacfil-724196993353.asia-northeast1.run.app';

  // Determine suggested record types
  const isSubdomain = cleanDomain.split('.').length > 2;

  const suggestedRecords = [
    {
      type: isSubdomain ? 'CNAME' : 'A',
      name: isSubdomain ? cleanDomain.split('.')[0] : '@',
      target: isSubdomain ? targetHost : '216.239.32.21',
      ttl: 3600,
      description: isSubdomain ? 'Arahkan subdomain ke target Cloud Run hosting' : 'Arahkan domain apex ke Google Cloud IP',
    },
    {
      type: 'TXT',
      name: '_edublox-challenge',
      target: `edublox-site-verification=${Buffer.from(cleanDomain).toString('base64').substring(0, 16)}`,
      ttl: 3600,
      description: 'Verifikasi kepemilikan domain sekolah / instansi',
    },
  ];

  res.json({
    domain: cleanDomain,
    targetHost,
    isSubdomain,
    records: suggestedRecords,
    recommendedConfig: {
      type: isSubdomain ? 'CNAME' : 'A / ALIAS',
      host: isSubdomain ? cleanDomain : `@ dan www.${cleanDomain}`,
      value: isSubdomain ? targetHost : '216.239.32.21 / 216.239.34.21 / 216.239.36.21 / 216.239.38.21',
      sslStatus: 'Auto-provisioning via Let\'s Encrypt / Google Managed SSL Certificate',
    },
    readyForPublic: true,
  });
});

// 3. Server-side Gemini AI Question Generator
app.post('/api/gemini/generate-questions', async (req, res) => {
  const { prompt, targetBuilding, count = 3 } = req.body;

  const defaultPrompt = prompt || 'Buat soal pilihan ganda Informatika kelas VIII tentang Berpikir Komputasional (Fungsi, Himpunan Data Terstruktur, Sistem Bilangan, atau Stack)';

  // Fallback questions if API key is not present or if quota/network error occurs
  const fallbackQuestions = [
    {
      id: `AI_${Date.now()}_1`,
      submateri: 'Berpikir Komputasional',
      q: 'Dalam struktur data Stack (Tumpukan), apabila piring A, B, C ditumpuk berturut-turut, piring manakah yang pertama kali diambil?',
      options: ['A. Piring C', 'B. Piring A', 'C. Piring B', 'D. Semua piring diambil bersamaan'],
      key: 'A',
      explanation: 'Stack menggunakan prinsip LIFO (Last In First Out), sehingga piring C yang terakhir masuk akan pertama kali diambil.',
    },
    {
      id: `AI_${Date.now()}_2`,
      submateri: 'Sistem Bilangan',
      q: 'Berapakah nilai desimal dari bilangan biner 1010₂?',
      options: ['A. 8', 'B. 10', 'C. 12', 'D. 14'],
      key: 'B',
      explanation: '1010₂ = (1 × 2³) + (0 × 2²) + (1 × 2¹) + (0 × 2⁰) = 8 + 0 + 2 + 0 = 10.',
    },
    {
      id: `AI_${Date.now()}_3`,
      submateri: 'Konsep Himpunan',
      q: 'Jika himpunan A = {2, 4, 6} dan B = {4, 6, 8}, maka A ∩ B (irisan himpunan) adalah ...',
      options: ['A. {2, 8}', 'B. {4, 6}', 'C. {2, 4, 6, 8}', 'D. { }'],
      key: 'B',
      explanation: 'Irisan (A ∩ B) adalah elemen yang terdapat pada kedua himpunan, yaitu {4, 6}.',
    },
  ];

  if (!aiClient) {
    return res.json({
      success: true,
      source: 'offline_curriculum_fallback',
      message: 'Soal dibuat menggunakan database kurikulum Informatika Kelas VIII.',
      questions: fallbackQuestions,
    });
  }

  try {
    const systemInstruction = `Anda adalah pakar pembuat soal Kurikulum Merdeka mata pelajaran Informatika SMP/MTs Kelas VIII (Bab 2 Berpikir Komputasional: Fungsi, Himpunan Data Terstruktur, Sistem Bilangan Desimal/Biner/Heksadesimal/Modulo, dan Struktur Data Stack LIFO).
Buat ${count} soal pilihan ganda berkualitas tinggi dalam Bahasa Indonesia.
Format setiap soal harus memiliki:
- submateri: string nama subbab
- q: string teks pertanyaan jelas
- options: array of 4 string dengan format "A. teks", "B. teks", "C. teks", "D. teks"
- key: huruf kapital pilihan yang benar ("A", "B", "C", atau "D")
- explanation: penjelasan logis dan edukatif mengapa kunci tersebut benar`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: defaultPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              submateri: { type: Type.STRING },
              q: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              key: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['submateri', 'q', 'options', 'key', 'explanation'],
          },
        },
      },
    });

    const jsonText = response.text?.trim() || '[]';
    const parsed = JSON.parse(jsonText);

    if (Array.isArray(parsed) && parsed.length > 0) {
      const formatted = parsed.map((item, idx) => ({
        id: `AI_GEN_${Date.now()}_${idx}`,
        submateri: item.submateri || 'Informatika VIII',
        q: item.q,
        options: item.options,
        key: item.key?.toUpperCase(),
        explanation: item.explanation,
      }));

      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        questions: formatted,
      });
    }

    throw new Error('Format respon AI tidak sesuai');
  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    return res.json({
      success: true,
      source: 'offline_curriculum_fallback',
      message: 'Soal dibuat menggunakan database kurikulum cadangan.',
      questions: fallbackQuestions,
    });
  }
});

// 4. Webhook Proxy for Google Apps Script to bypass CORS
app.post('/api/webhook-proxy', async (req, res) => {
  const { webhookUrl, payload } = req.body;
  if (!webhookUrl) {
    return res.status(400).json({ error: 'Webhook URL wajib diisi' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    res.json({ success: true, response: text });
  } catch (err: any) {
    res.status(502).json({ error: 'Gagal mengirim data ke Webhook Google Apps Script', details: err?.message });
  }
});

// Dev vs Prod Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Edublox City Server running on port ${PORT}`);
  });
}

startServer();
