'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload, Link2, X, FileText, FileAudio, Video,
  Presentation, Loader2, CheckCircle, Trash2,
  ExternalLink, File as FileIcon, Plus, Music
} from 'lucide-react';
import { uploadMaterial, deleteMaterial } from '@/app/actions/materials';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Material {
  id: string;
  file_name?: string;
  file_url?: string;
  file_type: string;
  link_url?: string;
  link_title?: string;
  file_size_bytes?: number;
  notes?: string;
  created_at: string;
}

interface MaterialPanelProps {
  studentId: string;
  lessonDate: string;
  initialMaterials?: Material[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.mp3,.wav,.m4a,.ogg,.mp4,.mov,.webm';
const MAX_SIZE_MB = 50;

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ type, className = 'w-5 h-5' }: { type: string; className?: string }) {
  const icons: Record<string, { icon: React.ReactNode; color: string }> = {
    pdf:   { icon: <FileText className={className} />,  color: 'text-rose-400' },
    word:  { icon: <FileText className={className} />,  color: 'text-blue-400' },
    ppt:   { icon: <Presentation className={className} />, color: 'text-orange-400' },
    audio: { icon: <Music className={className} />,     color: 'text-emerald-400' },
    video: { icon: <Video className={className} />,     color: 'text-cyan-400' },
    link:  { icon: <Link2 className={className} />,     color: 'text-brand-purple' },
    file:  { icon: <FileIcon className={className} />,  color: 'text-muted-foreground' },
  };
  const { icon, color } = icons[type] ?? icons.file;
  return <span className={color}>{icon}</span>;
}

function FileTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    pdf: 'PDF', word: 'Word', ppt: 'PowerPoint',
    audio: 'Áudio', video: 'Vídeo', link: 'Link', file: 'Arquivo'
  };
  const colors: Record<string, string> = {
    pdf:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
    word:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ppt:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
    audio: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    video: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    link:  'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
    file:  'bg-white/5 text-muted-foreground border-border',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colors[type] ?? colors.file}`}>
      {labels[type] ?? type}
    </span>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function MaterialUploadPanel({
  studentId,
  lessonDate,
  initialMaterials = [],
}: MaterialPanelProps) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [tab, setTab] = useState<'file' | 'link'>('file');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Drag & Drop ───────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  // ─── Upload ────────────────────────────────────────────────────────────────
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !linkUrl) return;

    if (file && file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Arquivo muito grande. Máximo de ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('studentId', studentId);
    fd.append('lessonDate', lessonDate);
    if (file) fd.append('file', file);
    if (linkUrl) {
      fd.append('linkUrl', linkUrl);
      fd.append('linkTitle', linkTitle || linkUrl);
    }

    const result = await uploadMaterial(fd);

    if (result.success) {
      setSuccess(true);
      setFile(null);
      setLinkUrl('');
      setLinkTitle('');
      if (fileRef.current) fileRef.current.value = '';
      setTimeout(() => setSuccess(false), 2500);
      // Refrescar a lista
      window.location.reload();
    } else {
      alert(result.error);
    }
    setUploading(false);
  }

  // ─── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(mat: Material) {
    if (!confirm(`Remover "${mat.file_name || mat.link_title}"?`)) return;
    setDeletingId(mat.id);
    await deleteMaterial(mat.id, studentId, mat.file_url);
    setMaterials(prev => prev.filter(m => m.id !== mat.id));
    setDeletingId(null);
  }

  const displayDate = new Date(lessonDate + 'T12:00:00').toLocaleDateString('pt-BR');

  return (
    <div className="space-y-6">

      {/* ─── Formulário de Upload ──────────────────────────────────────────── */}
      <div className="bg-card/30 border border-border/50 rounded-2xl overflow-hidden">

        {/* Tabs Arquivo / Link */}
        <div className="flex border-b border-border/50">
          <button
            onClick={() => setTab('file')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${tab === 'file' ? 'bg-brand-purple/10 text-brand-purple border-b-2 border-brand-purple' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Upload className="w-4 h-4" /> Enviar Arquivo
          </button>
          <button
            onClick={() => setTab('link')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${tab === 'link' ? 'bg-brand-purple/10 text-brand-purple border-b-2 border-brand-purple' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Link2 className="w-4 h-4" /> Anexar Link
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-5 space-y-4">

          {tab === 'file' ? (
            /* ─── Aba de Arquivo ─── */
            <>
              {/* Drop Zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-brand-purple bg-brand-purple/10'
                    : file
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-border/50 hover:border-brand-purple/50 hover:bg-brand-purple/5'
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="space-y-2">
                    <FileTypeIcon type={getClientFileType(file.name)} className="w-10 h-10 mx-auto" />
                    <p className="font-bold text-sm truncate px-4">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 mx-auto"
                    >
                      <X className="w-3 h-3" /> Remover
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">Arraste o arquivo aqui</p>
                      <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                      {['PDF', 'Word', 'PPT', 'MP3', 'MP4'].map(f => (
                        <span key={f} className="text-[10px] bg-white/5 border border-border px-2 py-0.5 rounded text-muted-foreground">{f}</span>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">Máximo: {MAX_SIZE_MB}MB</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ─── Aba de Link ─── */
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">URL do Link *</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  required={tab === 'link'}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Título / Descrição</label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={e => setLinkTitle(e.target.value)}
                  placeholder="Ex: Vídeo Aula - Grammar Unit 5"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-purple outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <div className="flex-1 text-[10px] text-muted-foreground/60 flex items-center gap-1">
              Aula: <span className="font-bold text-muted-foreground">{displayDate}</span>
            </div>
            <button
              type="submit"
              disabled={uploading || (!file && !linkUrl)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow ${
                success
                  ? 'bg-emerald-500 text-white'
                  : 'bg-brand-purple hover:bg-brand-purple-hover text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
              ) : success ? (
                <><CheckCircle className="w-4 h-4" /> Salvo!</>
              ) : (
                <><Plus className="w-4 h-4" /> Adicionar</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Lista de Materiais ────────────────────────────────────────────── */}
      {materials.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Materiais Anexados ({materials.length})
          </h4>
          {materials.map(mat => (
            <div
              key={mat.id}
              className="flex items-center gap-3 p-3 bg-card/40 border border-border/50 rounded-xl hover:border-brand-purple/30 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-border/50 flex items-center justify-center shrink-0">
                <FileTypeIcon type={mat.file_type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold truncate">
                    {mat.file_name || mat.link_title || mat.link_url}
                  </p>
                  <FileTypeBadge type={mat.file_type} />
                </div>
                {mat.file_size_bytes && (
                  <p className="text-[10px] text-muted-foreground">{formatBytes(mat.file_size_bytes)}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {(mat.file_url || mat.link_url) && (
                  <a
                    href={mat.file_url || mat.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-brand-purple/20 rounded-lg text-muted-foreground hover:text-brand-purple transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(mat)}
                  disabled={deletingId === mat.id}
                  className="p-1.5 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-400 transition-colors disabled:opacity-50"
                >
                  {deletingId === mat.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {materials.length === 0 && (
        <p className="text-center text-xs text-muted-foreground/50 italic py-2">
          Nenhum material anexado nesta aula ainda.
        </p>
      )}
    </div>
  );
}

// Helper client-side para detectar tipo por extensão
function getClientFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const types: Record<string, string> = {
    pdf: 'pdf', doc: 'word', docx: 'word',
    ppt: 'ppt', pptx: 'ppt',
    mp3: 'audio', wav: 'audio', m4a: 'audio', ogg: 'audio',
    mp4: 'video', mov: 'video', webm: 'video',
  };
  return types[ext] || 'file';
}
