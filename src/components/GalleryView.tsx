import React, { useState } from 'react';
import { 
  Plus, 
  Image as ImageIcon, 
  Trash2, 
  X, 
  Calendar, 
  Upload, 
  Maximize2,
  AlertCircle
} from 'lucide-react';
import { GalleryPhoto, ThemeConfig } from '../types';

interface GalleryViewProps {
  photos: GalleryPhoto[];
  theme: ThemeConfig;
  onAddPhoto: (photo: Omit<GalleryPhoto, 'id' | 'date'>) => void;
  onDeletePhoto: (id: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  photos,
  theme,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);

  // Simple Form state - only title, image, and optional description
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewError, setPreviewError] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          setPreviewError(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    onAddPhoto({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    });

    setTitle('');
    setDescription('');
    setImageUrl('');
    setShowAddModal(false);
  };

  const handleConfirmDelete = () => {
    if (!photoToDelete) return;
    onDeletePhoto(photoToDelete.id);
    if (selectedPhoto?.id === photoToDelete.id) {
      setSelectedPhoto(null);
    }
    setPhotoToDelete(null);
  };

  const isDark = theme.mode === 'dark';

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div 
        className="p-6 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#1c241e' : '#ffffff',
          borderColor: isDark ? '#2a382d' : '#e5e7eb',
        }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📌</span>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-stone-900 dark:text-emerald-300">
              Mural
            </h2>
          </div>
          <p className="text-xs md:text-sm text-stone-600 dark:text-stone-300 mt-1">
            Espaço simples para guardar fotos, momentos e registros de estudo.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#234d32] hover:bg-[#1a3d27] text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Foto</span>
        </button>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div 
          className="p-12 text-center rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-white/50 dark:bg-stone-900/30"
        >
          <ImageIcon className="w-12 h-12 mx-auto text-stone-400 mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
            Nenhuma foto no mural
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Clique no botão acima para adicionar sua primeira foto ao mural.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col group"
              style={{
                backgroundColor: isDark ? '#1c241e' : '#ffffff',
                borderColor: isDark ? '#2a382d' : '#e5e7eb',
              }}
            >
              {/* Photo Image Container */}
              <div 
                className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.imageUrl} 
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 text-white">
                  <span className="text-xs flex items-center gap-1 font-semibold">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Ampliar</span>
                  </span>
                </div>
              </div>

              {/* Photo Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-100 line-clamp-1 mb-1">
                    {photo.title}
                  </h3>

                  {photo.description && (
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {photo.description}
                    </p>
                  )}
                </div>

                {/* Footer with Date and Delete */}
                <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    <span>{photo.date}</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoToDelete(photo);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Excluir do mural"
                    aria-label="Excluir do mural"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Photo Expanded Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="w-full max-w-2xl rounded-3xl overflow-hidden border shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="relative max-h-[55vh] bg-black flex items-center justify-center overflow-hidden">
              <img 
                src={selectedPhoto.imageUrl} 
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-all"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Description */}
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-xl font-bold text-stone-900 dark:text-emerald-300">
                  {selectedPhoto.title}
                </h3>
                <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 font-medium shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{selectedPhoto.date}</span>
                </span>
              </div>

              {selectedPhoto.description && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 my-3">
                  <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                    {selectedPhoto.description}
                  </p>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const toDel = selectedPhoto;
                    setPhotoToDelete(toDel);
                  }}
                  className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir do Mural</span>
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-5 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] text-white text-xs font-bold transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Photo Modal (Simple, without tags) */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-emerald-300">
                  Adicionar ao Mural
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Título da Foto *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Resumo de Cálculo, Foto do laboratório..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Imagem (Upload do Computador ou Celular)
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors text-xs text-stone-700 dark:text-stone-300">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Escolher arquivo de imagem</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Ou Link direto da Imagem (URL)
                </label>
                <input 
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32]"
                />
              </div>

              {/* Preview */}
              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800">
                  <img 
                    src={imageUrl} 
                    alt="Prévia da foto" 
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                    referrerPolicy="no-referrer"
                  />
                  {previewError && (
                    <div className="absolute inset-0 bg-red-50 dark:bg-red-950/80 flex items-center justify-center text-xs text-red-600 dark:text-red-300 font-medium">
                      Não foi possível carregar a imagem deste link
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-800 dark:text-stone-300 mb-1">
                  Legenda ou Anotação (Opcional)
                </label>
                <textarea 
                  rows={2}
                  placeholder="Escreva uma breve observação ou memória sobre essa foto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#234d32] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!title || !imageUrl}
                  className="px-5 py-2 rounded-xl bg-[#234d32] hover:bg-[#1a3d27] disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Adicionar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete In-App Modal */}
      {photoToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div 
            className="w-full max-w-sm rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95"
            style={{
              backgroundColor: isDark ? '#1c241e' : '#ffffff',
              borderColor: isDark ? '#2a382d' : '#e5e7eb',
            }}
          >
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 border border-red-200 dark:border-red-900/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  Excluir do Mural?
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                  Tem certeza que deseja remover a foto <strong className="font-bold text-stone-900 dark:text-stone-100">"{photoToDelete.title}"</strong> do mural?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="px-4 py-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
