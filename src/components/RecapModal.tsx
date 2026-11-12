import React, { useState } from 'react';
import { RecapItem } from '../types/game';
import { FileSpreadsheet, Download, Copy, Send, Check, HelpCircle } from 'lucide-react';
import { playSFX } from '../utils/audio';

interface RecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  recapData: RecapItem[];
  playerCount: number;
}

export const RecapModal: React.FC<RecapModalProps> = ({
  isOpen,
  onClose,
  recapData,
  playerCount,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('edublox_webhook_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedTsv, setCopiedTsv] = useState(false);

  if (!isOpen) return null;

  const total = recapData.length;
  const correct = recapData.filter((r) => r.status === 'BENAR').length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleExportCSV = () => {
    if (recapData.length === 0) {
      alert('Belum ada data aktivitas murid untuk diekspor!');
      return;
    }
    playSFX('click');
    let csvContent = '\uFEFFWaktu,Kelas,Pemain,Gedung,Materi,Pertanyaan,JawabanMurid,Kunci,Status,Poin\n';
    recapData.forEach((r) => {
      csvContent += `"${r.time}","${r.school}","${r.player}","${r.building}","${r.materi}","${r.question.replace(/"/g, '""')}","${r.userAns}","${r.key}","${r.status}","${r.points}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Edublox_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTSV = () => {
    if (recapData.length === 0) {
      alert('Belum ada data aktivitas untuk disalin!');
      return;
    }
    let tsv = 'Waktu\tKelas\tPemain\tGedung\tMateri\tStatus\tPoin\tJawaban\n';
    recapData.forEach((r) => {
      tsv += `${r.time}\t${r.school}\t${r.player}\t${r.building}\t${r.materi}\t${r.status}\t${r.points}\t${r.userAns}\n`;
    });

    navigator.clipboard.writeText(tsv).then(() => {
      playSFX('click');
      setCopiedTsv(true);
      setTimeout(() => setCopiedTsv(false), 2500);
      alert('Tabel berhasil disalin dalam format TSV! Buka Google Sheets lalu tekan Ctrl+V.');
    });
  };

  const handleSaveWebhook = () => {
    localStorage.setItem('edublox_webhook_url', webhookUrl);
    playSFX('click');
    alert('URL Webhook Google Apps Script berhasil disimpan!');
  };

  const handleSyncAllToGoogleSheets = async () => {
    if (!webhookUrl) {
      alert('Masukkan URL Webhook Google Apps Script terlebih dahulu!');
      return;
    }
    if (recapData.length === 0) {
      alert('Belum ada data nilai untuk dikirim!');
      return;
    }

    setIsSyncing(true);
    playSFX('click');
    try {
      // Send via server proxy to bypass CORS
      const res = await fetch('/api/webhook-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          payload: {
            timestamp: new Date().toISOString(),
            records: recapData,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSFX('victory');
        alert('Berhasil mensinkronisasi data ke Google Sheets!');
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      console.error(e);
      alert('Gagal mengirim ke Google Sheets. Pastikan Webhook Web App sudah disetel ke "Anyone" access.');
    } finally {
      setIsSyncing(false);
    }
  };

  const showAppsScriptCode = () => {
    const code = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  var records = payload.records || [payload];
  
  records.forEach(function(r) {
    sheet.appendRow([new Date(), r.school, r.player, r.building, r.materi, r.question, r.userAns, r.key, r.status, r.points]);
  });
  
  return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
}`;
    navigator.clipboard.writeText(code);
    playSFX('click');
    alert('Kode Google Apps Script doPost(e) disalin ke clipboard! Tempelkan di Google Sheets > Extensions > Apps Script, lalu Deploy as Web App.');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-amber-400 p-5 md:p-6 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-slate-800">
                Rekap Nilai Murid & Ekspor Spreadsheet
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Pantau keaktifan siswa secara real-time dan ekspor ke Excel atau Google Sheets.
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-center">
            <p className="text-[10px] font-bold text-blue-600 uppercase">Total Aktivitas</p>
            <p className="font-heading text-2xl font-bold text-blue-900">{total}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Jawaban Benar</p>
            <p className="font-heading text-2xl font-bold text-emerald-900">{correct}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-center">
            <p className="text-[10px] font-bold text-amber-600 uppercase">Rata-Rata Akurasi</p>
            <p className="font-heading text-2xl font-bold text-amber-900">{accuracy}%</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-center">
            <p className="text-[10px] font-bold text-purple-600 uppercase">Skuad Pemain</p>
            <p className="font-heading text-2xl font-bold text-purple-900">{playerCount}</p>
          </div>
        </div>

        {/* Export & Webhook Controls */}
        <div className="bg-slate-50 p-4 rounded-2xl border flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-blox btn-blox-green text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download Excel / CSV
            </button>
            <button
              onClick={handleCopyTSV}
              className="btn-blox btn-blox-blue text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5"
            >
              {copiedTsv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedTsv ? 'Tersalin!' : 'Salin Tabel (TSV)'}
            </button>
          </div>

          <div className="flex items-center gap-2 max-w-md w-full">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="URL Webhook Google Apps Script (doPost)"
              className="text-xs p-2 bg-white border border-slate-300 rounded-xl font-semibold flex-1 text-slate-800"
            />
            <button
              onClick={handleSaveWebhook}
              className="btn-blox btn-blox-purple text-xs px-3 py-2 rounded-xl font-bold flex-shrink-0"
            >
              Simpan
            </button>
            <button
              onClick={handleSyncAllToGoogleSheets}
              disabled={isSyncing}
              className="btn-blox btn-blox-yellow text-slate-950 text-xs px-3 py-2 rounded-xl font-bold flex-shrink-0 flex items-center gap-1"
            >
              <Send className="w-3 h-3" /> Sync
            </button>
            <button
              onClick={showAppsScriptCode}
              className="text-xs text-blue-600 font-bold underline flex-shrink-0"
              title="Salin contoh kode Google Apps Script"
            >
              Script
            </button>
          </div>
        </div>

        {/* Table of Records */}
        <div className="overflow-x-auto border rounded-2xl max-h-60 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b sticky top-0">
              <tr>
                <th className="p-2.5">Waktu</th>
                <th className="p-2.5">Pemain</th>
                <th className="p-2.5">Gedung / Materi</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Poin</th>
                <th className="p-2.5">Jawaban Murid</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-600">
              {recapData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                    Belum ada kuis yang dikerjakan. Dekati gedung di kota 3D dan jawab kuis serentak!
                  </td>
                </tr>
              ) : (
                recapData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono">{row.time}</td>
                    <td className="p-2.5 font-bold text-slate-800">{row.player}</td>
                    <td className="p-2.5">
                      {row.building} - {row.materi}
                    </td>
                    <td className={`p-2.5 font-bold ${row.status === 'BENAR' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {row.status}
                    </td>
                    <td className="p-2.5 font-bold text-slate-800">+{row.points}</td>
                    <td className="p-2.5 text-slate-500 max-w-xs truncate">
                      Pilihan {row.userAns} (Kunci: {row.key})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
