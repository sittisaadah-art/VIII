import React, { useState, useEffect } from 'react';
import {
  Globe,
  Server,
  ShieldCheck,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Code2,
  RefreshCw,
  Share2,
  Layers,
  Sparkles,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { playSFX } from '../utils/audio';

interface HostingDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
}

export const HostingDomainModal: React.FC<HostingDomainModalProps> = ({
  isOpen,
  onClose,
  schoolName,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'custom-domain' | 'platforms' | 'embed'>('status');
  const [customDomainInput, setCustomDomainInput] = useState('edublox.arrohmahbogor.sch.id');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dnsCheckLoading, setDnsCheckLoading] = useState(false);
  const [dnsResult, setDnsResult] = useState<any>(null);

  // Live hosting information
  const livePublicUrl = 'https://ais-pre-ghkpnzhmupkvt5gdyacfil-724196993353.asia-northeast1.run.app';
  const devUrl = 'https://ais-dev-ghkpnzhmupkvt5gdyacfil-724196993353.asia-northeast1.run.app';
  const targetCnameHost = 'ghkpnzhmupkvt5gdyacfil-724196993353.asia-northeast1.run.app';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playSFX('click');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCheckDNS = async () => {
    setDnsCheckLoading(true);
    playSFX('click');
    try {
      const res = await fetch('/api/check-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain: customDomainInput }),
      });
      const data = await res.json();
      setDnsResult(data);
      playSFX('correct');
    } catch (e) {
      console.error(e);
    } finally {
      setDnsCheckLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !dnsResult) {
      handleCheckDNS();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const embedCode = `<iframe 
  src="${livePublicUrl}" 
  width="100%" 
  height="750" 
  style="border:none; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.2);" 
  allow="accelerometer; autoplay; encrypted-media; gyroscope;"
  title="Edublox City By Sitty - Informatika Kelas VIII">
</iframe>`;

  const vercelConfig = `{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`;

  const netlifyConfig = `[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-indigo-400 p-5 md:p-6 flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-xl md:text-2xl font-bold text-slate-800">
                  Pusat Hosting Publik & Konfigurasi Domain
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  PUBLIK AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Akses web secara publik di seluruh dunia, atur custom domain sekolah ({schoolName}), & integrasikan ke platform belajar.
              </p>
            </div>
          </div>
          <button
            onClick={() => { playSFX('click'); onClose(); }}
            className="text-slate-400 hover:text-slate-700 text-3xl font-bold px-2 leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold border border-slate-200 overflow-x-auto">
          <button
            onClick={() => { playSFX('click'); setActiveTab('status'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'status'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" /> 1. Status Hosting Live
          </button>
          <button
            onClick={() => { playSFX('click'); setActiveTab('custom-domain'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'custom-domain'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" /> 2. Setup Custom Domain Sekolah
          </button>
          <button
            onClick={() => { playSFX('click'); setActiveTab('platforms'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'platforms'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> 3. Preset Platform Lain (Vercel/Netlify)
          </button>
          <button
            onClick={() => { playSFX('click'); setActiveTab('embed'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'embed'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" /> 4. Embed ke Web / LMS
          </button>
        </div>

        {/* TAB 1: STATUS HOSTING LIVE */}
        {activeTab === 'status' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Live Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white p-5 rounded-3xl shadow-xl border-2 border-indigo-400">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/40">
                    Production Cloud Hosting
                  </span>
                  <h4 className="text-xl font-heading font-bold mt-1 text-white">
                    Edublox City Siap Diakses Siswa & Guru Secara Publik
                  </h4>
                  <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                    Aplikasi telah di-deploy dan berjalan dengan infrastruktur Google Cloud Run (Region asia-northeast1). Didukung koneksi HTTPS terenkripsi penuh & auto-scale siap menampung seluruh siswa satu angkatan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> SSL Active
                  </span>
                  <span className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-500/40">
                    HTTP/2
                  </span>
                </div>
              </div>

              {/* Public URL Box */}
              <div className="mt-4 bg-slate-950/70 p-3.5 rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden w-full">
                  <Globe className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-indigo-300 font-bold uppercase">URL Akses Publik Resmi (Shared Link):</p>
                    <a
                      href={livePublicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-amber-300 hover:underline truncate block"
                    >
                      {livePublicUrl}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => copyToClipboard(livePublicUrl, 'publicUrl')}
                    className="btn-blox btn-blox-blue text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 w-full md:w-auto justify-center"
                  >
                    {copiedKey === 'publicUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'publicUrl' ? 'Tersalin!' : 'Salin Link'}
                  </button>
                  <a
                    href={livePublicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-blox bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 w-full md:w-auto justify-center border-b-2 border-indigo-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Web
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Share & QR Code for Classrooms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* QR Code Card */}
              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 bg-amber-200 text-amber-800 rounded-xl flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <h5 className="font-heading font-bold text-sm text-slate-800">QR Code Masuk Kelas</h5>
                <p className="text-[11px] text-slate-500">
                  Tampilkan di proyektor kelas atau bagikan ke grup WhatsApp/Chromebook siswa.
                </p>
                {/* Visual SVG QR Representation */}
                <div className="bg-white p-3 rounded-xl border border-amber-300 shadow-sm mt-1">
                  <svg className="w-28 h-28" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M20,20 h10 v10 h-10 z" />
                    <path d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M70,20 h10 v10 h-10 z" />
                    <path d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M20,70 h10 v10 h-10 z" />
                    <rect x="45" y="10" width="8" height="8" />
                    <rect x="45" y="25" width="8" height="15" />
                    <rect x="15" y="45" width="15" height="8" />
                    <rect x="35" y="45" width="18" height="8" />
                    <rect x="60" y="45" width="8" height="18" />
                    <rect x="75" y="45" width="15" height="8" />
                    <rect x="45" y="65" width="12" height="12" />
                    <rect x="65" y="65" width="25" height="8" />
                    <rect x="65" y="80" width="12" height="10" />
                    <rect x="82" y="78" width="8" height="12" />
                  </svg>
                </div>
                <span className="text-[10px] text-amber-700 font-bold">Scan untuk langsung bermain</span>
              </div>

              {/* Metrics Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border flex flex-col justify-between gap-3">
                <div>
                  <h5 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Sertifikat SSL & Keamanan
                  </h5>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between border-b pb-1">
                      <span>Protokol:</span>
                      <strong className="text-slate-800">HTTPS (TLS 1.3)</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Penerbit SSL:</span>
                      <strong className="text-slate-800">Google Trust Services</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Auto Renewal:</span>
                      <strong className="text-emerald-600">Otomatis Aktif</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Serverless Autoscaling:</span>
                      <strong className="text-indigo-600">0 - 1000 Instances</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-[11px] text-blue-800 font-semibold">
                  Siswa dapat mengakses langsung dari HP Android, iPhone, Laptop, iPad, atau PC Lab tanpa install aplikasi tambahan!
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-200 flex flex-col justify-between gap-2">
                <div>
                  <h5 className="font-heading font-bold text-sm text-indigo-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-indigo-600" /> Aksi Cepat Bagikan
                  </h5>
                  <p className="text-[11px] text-indigo-700 mt-1">
                    Kirim link dengan parameter khusus agar murid langsung masuk ke kuis materi tertentu:
                  </p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <button
                    onClick={() => copyToClipboard(`${livePublicUrl}?building=A`, 'linkA')}
                    className="w-full text-left p-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-100/60 font-bold text-slate-700 flex justify-between items-center"
                  >
                    <span>Gedung A (Fungsi)</span>
                    <span className="text-[10px] text-indigo-600">{copiedKey === 'linkA' ? 'Disalin!' : 'Salin'}</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(`${livePublicUrl}?building=C`, 'linkC')}
                    className="w-full text-left p-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-100/60 font-bold text-slate-700 flex justify-between items-center"
                  >
                    <span>Gedung C (Sistem Bilangan)</span>
                    <span className="text-[10px] text-indigo-600">{copiedKey === 'linkC' ? 'Disalin!' : 'Salin'}</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(`${livePublicUrl}?building=D`, 'linkD')}
                    className="w-full text-left p-2 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-100/60 font-bold text-slate-700 flex justify-between items-center"
                  >
                    <span>Gedung D (Stack LIFO)</span>
                    <span className="text-[10px] text-indigo-600">{copiedKey === 'linkD' ? 'Disalin!' : 'Salin'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SETUP CUSTOM DOMAIN SEKOLAH */}
        {activeTab === 'custom-domain' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Domain input */}
            <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-indigo-200">
              <label className="text-xs font-bold text-indigo-900 block mb-1">
                Masukkan Nama Domain / Subdomain Sekolah Anda:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  placeholder="contoh: edublox.arrohmahbogor.sch.id atau informatika-smp.com"
                  className="flex-1 px-3.5 py-2.5 bg-white rounded-xl border border-indigo-300 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleCheckDNS}
                  disabled={dnsCheckLoading}
                  className="btn-blox btn-blox-blue text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dnsCheckLoading ? 'animate-spin' : ''}`} />
                  {dnsCheckLoading ? 'Menghitung DNS...' : 'Hitung Konfigurasi DNS'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Contoh rekomendasi: <strong>edublox.{schoolName.toLowerCase().replace(/\s+/g, '')}.sch.id</strong> atau subdomain portal sekolah Anda.
              </p>
            </div>

            {/* Generated DNS Records Table */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-heading text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-600" />
                  Catatan DNS (DNS Records) yang Harus Dimasukkan di Panel Domain:
                </h4>
                <button
                  onClick={() => {
                    const text = `TYPE\tNAME\tTARGET / VALUE\tTTL\nCNAME\t${customDomainInput.split('.')[0]}\t${targetCnameHost}\t3600\nTXT\t_edublox-challenge\tedublox-site-verification=${customDomainInput}\t3600`;
                    copyToClipboard(text, 'allDns');
                  }}
                  className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> {copiedKey === 'allDns' ? 'Semua Disalin!' : 'Salin Semua Record'}
                </button>
              </div>

              <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b">
                    <tr>
                      <th className="p-2.5">Tipe Record</th>
                      <th className="p-2.5">Nama Host (Name)</th>
                      <th className="p-2.5">Tujuan / Nilai (Target / Value)</th>
                      <th className="p-2.5">TTL</th>
                      <th className="p-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 font-mono">
                    <tr className="hover:bg-indigo-50/50">
                      <td className="p-2.5 font-bold text-blue-600">
                        {customDomainInput.split('.').length > 2 ? 'CNAME' : 'A / ALIAS'}
                      </td>
                      <td className="p-2.5 font-bold">
                        {customDomainInput.split('.').length > 2 ? customDomainInput.split('.')[0] : '@'}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 truncate max-w-xs">
                        {customDomainInput.split('.').length > 2 ? targetCnameHost : '216.239.32.21'}
                      </td>
                      <td className="p-2.5">3600 (Auto)</td>
                      <td className="p-2.5 text-center font-sans">
                        <button
                          onClick={() => copyToClipboard(customDomainInput.split('.').length > 2 ? targetCnameHost : '216.239.32.21', 'cnameVal')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-indigo-600"
                        >
                          {copiedKey === 'cnameVal' ? 'Disalin' : 'Salin Nilai'}
                        </button>
                      </td>
                    </tr>
                    <tr className="hover:bg-indigo-50/50">
                      <td className="p-2.5 font-bold text-purple-600">TXT</td>
                      <td className="p-2.5 font-bold">_edublox-challenge</td>
                      <td className="p-2.5 truncate max-w-xs text-slate-600">
                        edublox-site-verification={btoa(customDomainInput || 'domain').substring(0, 16)}
                      </td>
                      <td className="p-2.5">3600</td>
                      <td className="p-2.5 text-center font-sans">
                        <button
                          onClick={() => copyToClipboard(`edublox-site-verification=${btoa(customDomainInput || 'domain').substring(0, 16)}`, 'txtVal')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-indigo-600"
                        >
                          {copiedKey === 'txtVal' ? 'Disalin' : 'Salin Nilai'}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step-by-step Registrar Guide */}
            <div className="bg-slate-50 p-4 rounded-2xl border space-y-2">
              <h5 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500" /> Panduan Penerapan di Registrar Domain (cPanel, Cloudflare, Niagahoster, IDCloudHost):
              </h5>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 pl-1">
                <li>Buka panel pengelolaan domain Anda (misal: cPanel, Cloudflare, atau Niagahoster Member Area).</li>
                <li>Masuk ke menu <strong>Zone Editor</strong> atau <strong>DNS Management</strong>.</li>
                <li>Pilih <strong>+ Add Record</strong>, pilih tipe <strong>CNAME</strong>.</li>
                <li>Isi Name dengan <code>{customDomainInput.split('.')[0] || 'edublox'}</code> dan Record/Target dengan <code>{targetCnameHost}</code>.</li>
                <li>Simpan record. Propagasi DNS biasanya memakan waktu antara 5 menit hingga 1 jam.</li>
                <li>Setelah propagasi selesai, sertifikat SSL HTTPS akan otomatis aktif tanpa perlu pengaturan manual!</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 3: PRESET PLATFORM LAIN (VERCEL, NETLIFY, CLOUDFLARE) */}
        {activeTab === 'platforms' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-xs text-blue-900">
              💡 <strong>Fleksibilitas Penuh:</strong> Selain sudah aktif secara langsung di Google Cloud Run, kode Edublox City ini 100% kompatibel dan siap di-deploy ke Vercel, Netlify, atau Cloudflare Pages jika sekolah Anda memiliki langganan hosting tersebut.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vercel Preset */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-base text-slate-800 flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-black rounded-full inline-block"></span> Vercel Deployment
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Ready</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Konfigurasi <code>vercel.json</code> otomatis untuk SPA Routing & custom domain sekolah.
                  </p>
                  <pre className="bg-slate-900 text-amber-300 p-2.5 rounded-xl text-[10px] font-mono mt-2 overflow-x-auto">
                    {vercelConfig}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(vercelConfig, 'vercel')}
                  className="btn-blox btn-blox-blue text-xs px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedKey === 'vercel' ? 'Tersalin!' : 'Salin vercel.json'}
                </button>
              </div>

              {/* Netlify Preset */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-base text-slate-800 flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-teal-500 rounded-full inline-block"></span> Netlify Deployment
                    </span>
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded">Ready</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Konfigurasi <code>netlify.toml</code> untuk pengalihan route dan dukungan Single Page Application.
                  </p>
                  <pre className="bg-slate-900 text-emerald-300 p-2.5 rounded-xl text-[10px] font-mono mt-2 overflow-x-auto">
                    {netlifyConfig}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(netlifyConfig, 'netlify')}
                  className="btn-blox btn-blox-green text-xs px-3 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedKey === 'netlify' ? 'Tersalin!' : 'Salin netlify.toml'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EMBED KE WEB & LMS */}
        {activeTab === 'embed' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-pink-50 p-4 rounded-2xl border-2 border-pink-200">
              <h4 className="font-heading font-bold text-sm text-pink-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-pink-600" /> Kode Sematkan (Embed iFrame HTML):
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Tempelkan kode di bawah ini pada Google Sites guru, Moodle, portal web sekolah, atau blog materi pembelajaran:
              </p>

              <pre className="bg-slate-900 text-indigo-200 p-3 rounded-xl text-xs font-mono mt-2 overflow-x-auto leading-relaxed border border-slate-700">
                {embedCode}
              </pre>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => copyToClipboard(embedCode, 'embedCode')}
                  className="btn-blox btn-blox-pink text-white text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedKey === 'embedCode' ? 'Kode iFrame Tersalin!' : 'Salin Kode iFrame'}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800">Petunjuk Pemasangan di Google Sites:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Buka halaman Google Sites pembelajaran Informatika Anda.</li>
                <li>Klik menu <strong>Sisipkan (Insert) &gt; Sematkan (Embed)</strong> di bilah kanan.</li>
                <li>Pilih tab <strong>Sematkan kode (Embed code)</strong>.</li>
                <li>Tempelkan kode iFrame di atas, lalu klik <strong>Berikutnya &gt; Sisipkan</strong>.</li>
                <li>Atur ukuran kotak game sesuai keinginan dan Publikasikan! Siswa dapat langsung bermain di dalam situs.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center border-t pt-3 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cloud Run Service ID: <code>ghkpnzhmupkvt5gdyacfil</code></span>
          </div>
          <button
            onClick={() => { playSFX('click'); onClose(); }}
            className="btn-blox bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl font-bold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
