import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Eye,
  Camera,
} from 'lucide-react';
import {
  GRADE_9_LANDSCAPE,
  GRADE_10_LANDSCAPE,
  GRADE_11_LANDSCAPE,
  GRADE_12_LANDSCAPE,
  FRESHMAN_LANDSCAPE,
  SUBJECT_MATH_IMAGE,
  SUBJECT_PHYSICS_IMAGE,
  SUBJECT_CHEMISTRY_IMAGE,
  SUBJECT_BIOLOGY_IMAGE,
  SUBJECT_HISTORY_IMAGE,
  SUBJECT_GEOGRAPHY_IMAGE,
  SUBJECT_ECONOMICS_IMAGE,
  SUBJECT_ENGLISH_IMAGE,
  SUBJECT_PSYCHOLOGY_IMAGE,
  SUBJECT_LOGIC_IMAGE,
  CHAPTER_BANNER_1,
  CHAPTER_BANNER_2,
  CHAPTER_BANNER_3,
  CHAPTER_BANNER_4,
  CHAPTER_BANNER_5,
  CHAPTER_BANNER_6,
  HERO_BANNER_IMAGE,
} from '../../data/mockData';

export interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImage?: string;
  title?: string;
  targetType?: 'grade' | 'subject' | 'chapter' | 'part';
}

const PRESET_GALLERY = [
  // Subject & Chapter Visuals
  { id: 'math', label: 'Mathematics', url: SUBJECT_MATH_IMAGE, category: 'subject' },
  { id: 'phys', label: 'Physics', url: SUBJECT_PHYSICS_IMAGE, category: 'subject' },
  { id: 'chem', label: 'Chemistry', url: SUBJECT_CHEMISTRY_IMAGE, category: 'subject' },
  { id: 'bio', label: 'Biology', url: SUBJECT_BIOLOGY_IMAGE, category: 'subject' },
  { id: 'hist', label: 'History', url: SUBJECT_HISTORY_IMAGE, category: 'subject' },
  { id: 'geog', label: 'Geography', url: SUBJECT_GEOGRAPHY_IMAGE, category: 'subject' },
  { id: 'econ', label: 'Economics', url: SUBJECT_ECONOMICS_IMAGE, category: 'subject' },
  { id: 'eng', label: 'English', url: SUBJECT_ENGLISH_IMAGE, category: 'subject' },
  { id: 'psych', label: 'Psychology', url: SUBJECT_PSYCHOLOGY_IMAGE, category: 'subject' },
  { id: 'logic', label: 'Philosophy & Logic', url: SUBJECT_LOGIC_IMAGE, category: 'subject' },

  // Chapter Banners
  { id: 'ch1', label: 'Chapter Banner 1 (Blue Glow)', url: CHAPTER_BANNER_1, category: 'chapter' },
  { id: 'ch2', label: 'Chapter Banner 2 (Emerald Nature)', url: CHAPTER_BANNER_2, category: 'chapter' },
  { id: 'ch3', label: 'Chapter Banner 3 (Purple Cosmos)', url: CHAPTER_BANNER_3, category: 'chapter' },
  { id: 'ch4', label: 'Chapter Banner 4 (Amber Laboratory)', url: CHAPTER_BANNER_4, category: 'chapter' },
  { id: 'ch5', label: 'Chapter Banner 5 (Teal Equations)', url: CHAPTER_BANNER_5, category: 'chapter' },
  { id: 'ch6', label: 'Chapter Banner 6 (Indigo Structure)', url: CHAPTER_BANNER_6, category: 'chapter' },

  // Grade Landcapes
  { id: 'g9', label: 'Grade 9 Landscape', url: GRADE_9_LANDSCAPE, category: 'grade' },
  { id: 'g10', label: 'Grade 10 Landscape', url: GRADE_10_LANDSCAPE, category: 'grade' },
  { id: 'g11', label: 'Grade 11 Landscape', url: GRADE_11_LANDSCAPE, category: 'grade' },
  { id: 'g12', label: 'Grade 12 Landscape', url: GRADE_12_LANDSCAPE, category: 'grade' },
  { id: 'fresh', label: 'Freshman Landscape', url: FRESHMAN_LANDSCAPE, category: 'grade' },
];

export const ImageSelectorModal: React.FC<ImageSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImage = '',
  title = 'Fakkii Jijjiiri / Filadhu',
  targetType = 'subject',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage);
  const [customUrl, setCustomUrl] = useState<string>(currentImage);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("Guddinni fakkii 25MB caaluu hin qabu.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.imageUrl) {
        setPreviewUrl(data.imageUrl);
        setCustomUrl(data.imageUrl);
        setUploadSuccess("Fakkiin galmee (gallery) irraa milkaa'inaan fe'ameera!");
      } else {
        setUploadError(data.error || "Fakkicha fe'uun hin danda'amne.");
      }
    } catch (err: any) {
      setUploadError(`Dogoggora qunnamaa: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    if (!previewUrl) return;
    onSelectImage(previewUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500">
                Gallery bilbilaa irraa fe'i ykn fakkiiwwan filataman keessaa filadhu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Gallery irraa Fe'i (Upload)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'preset'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fakkiiwwan Qophaa'an (Presets)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>URL Galchi</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* TAB 1: UPLOAD FROM GALLERY */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isUploading
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
                  {isUploading ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  ) : (
                    <Upload className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
                <span className="font-bold text-slate-800 text-sm block">
                  {isUploading ? "Fakkiin fe'amaa jira..." : "Fakkii Gallery Keessanii Irraa Filadhaa"}
                </span>
                <p className="text-slate-500 text-[11px] mt-1">
                  JPG, PNG, WebP (hanga 25 MB). Yeroo barataan banu akkuma jirutti mul'ata.
                </p>
                <button
                  type="button"
                  disabled={isUploading}
                  className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Gallery Bani (Choose from Gallery)
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                  {uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CURATED PRESETS */}
          {activeTab === 'preset' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                {PRESET_GALLERY.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setPreviewUrl(item.url);
                      setCustomUrl(item.url);
                    }}
                    className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video bg-slate-900 ${
                      previewUrl === item.url
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end p-2">
                      <span className="text-[10px] font-bold text-white truncate drop-shadow-xs">
                        {item.label}
                      </span>
                    </div>
                    {previewUrl === item.url && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL Fakkii (Image Web Link):
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => {
                    setCustomUrl(e.target.value);
                    setPreviewUrl(e.target.value.trim());
                  }}
                  placeholder="https://example.com/cover-image.jpg"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* LIVE ASPECT PREVIEW BOX */}
          {previewUrl && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 block flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Akkamitti akka mul'atu (Live Student Preview):</span>
              </span>
              <div className="relative aspect-[16/8] rounded-xl overflow-hidden bg-slate-950 border border-slate-300 shadow-inner group">
                <img
                  src={previewUrl}
                  alt="Selected Preview"
                  onError={e => {
                    e.currentTarget.src = HERO_BANNER_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex items-end p-4 text-white">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white font-extrabold text-[10px] uppercase tracking-wider inline-block mb-1">
                      {targetType.toUpperCase()} COVER
                    </span>
                    <h4 className="font-serif text-lg font-bold drop-shadow-md">
                      Fakkeenya Qabiyyee Barattootaa
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-xs"
          >
            Dhiisi (Cancel)
          </button>
          <button
            type="button"
            disabled={!previewUrl || isUploading}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Fakkii Kana Mirkaneessi (Save Image)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
