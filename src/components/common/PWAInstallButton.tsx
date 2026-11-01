import React, { useState } from 'react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PWAInstallButtonProps {
  isOromo?: boolean;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ isOromo = true, className = '' }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'public_url' | 'apk'>('install');
  const [copied, setCopied] = useState(false);

  // Canonical standalone public web link that opens directly without AI Studio wrapper
  const PUBLIC_APP_URL = 'https://ais-pre-oqjs24ppi5xggxhuyoyjxh-63446449139.europe-west2.run.app';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(PUBLIC_APP_URL);
      } else {
        const input = document.createElement('textarea');
        input.value = PUBLIC_APP_URL;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all transform hover:scale-[1.02] active:scale-95 ${className}`}
        title={isOromo ? "Appii Bilbilaa Dhaabbadhaa / Liinkii Qulqulluu" : "Install Standalone Mobile App"}
      >
        <Smartphone className="w-4 h-4 text-emerald-200" />
        <span>{isInstalled ? (isOromo ? 'Appii Dhaabameera' : 'App Installed') : (isOromo ? 'Appii Bilbilaa Buufadhu' : 'Install Standalone App')}</span>
      </button>

      {/* Standalone Application & Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-500/30">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isOromo ? "Appii ODA EDU Of Danda'aa (Standalone)" : "ODA EDU Standalone Application"}
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold">
                    {isOromo ? "Google AI Studio Malee Kallattiin Argachuu" : "Independent from Google AI Studio"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('install')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition-all text-center ${
                  activeTab === 'install'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isOromo ? "1. Bilbila Irratti Fe'i" : '1. Install on Phone'}
              </button>
              <button
                onClick={() => setActiveTab('public_url')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition-all text-center ${
                  activeTab === 'public_url'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isOromo ? '2. Liinkii Qulqulluu' : '2. Public Link'}
              </button>
              <button
                onClick={() => setActiveTab('apk')}
                className={`flex-1 py-2 px-2.5 rounded-lg transition-all text-center ${
                  activeTab === 'apk'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isOromo ? '3. APK & Play Store' : '3. APK / Domain'}
              </button>
            </div>

            {/* TAB 1: Mobile Phone Installation (PWA) */}
            {activeTab === 'install' && (
              <div className="space-y-4">
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{isOromo ? "Bilbila Irratti Akka App (Native App) Ta'ee Hojjata" : "Works as a Full Standalone App"}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {isOromo
                      ? "Appiin kun PWA (Progressive Web App) waan ta'eef, osoo Google AI Studio hin banin kallattiin iskiriinii bilbila keessanii irraa asxaa (logo) ODA EDU tuquun bana."
                      : "Because this is a certified Progressive Web App, it launches directly from your mobile home screen with the official icon, completely independent of the AI Studio editor."}
                  </p>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-slate-800">
                        {isOromo ? 'Biraawuzerii Chrome / Samsung keessatti:' : 'In Chrome or Android browser:'}
                      </span>
                      <p className="text-slate-500 mt-0.5">
                        {isOromo
                          ? 'Tuqaalee sadii (⋮) gara mirga gubbaa jiru tuqaa.'
                          : 'Tap the three dots menu (⋮) at the top-right corner.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-slate-800">
                        {isOromo ? '"Install app" ykn "Add to Home screen"' : '"Install app" or "Add to Home Screen"'}
                      </span>
                      <p className="text-slate-500 mt-0.5">
                        {isOromo
                          ? 'Tarree filannoo irraa "Appii Fe\'i" (Install application) filadhaa.'
                          : 'Select "Install app" or "Add to Home Screen".'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-slate-800">
                        {isOromo ? 'Iskiriinii Bilbilaa Irratti Banti:' : 'Launch from Phone Home Screen:'}
                      </span>
                      <p className="text-slate-500 mt-0.5">
                        {isOromo
                          ? "Asxaan ODA EDU bilbila keessan irra taa'a; iskiriinii guutuutti banti, intarneetiin yoo dhabames fiidiyoo buufame ni bana!"
                          : "ODA EDU icon appears on your home screen. It opens in full-screen standalone mode with offline support!"}
                      </p>
                    </div>
                  </div>
                </div>

                {isInstallable && (
                  <button
                    onClick={async () => {
                      await install();
                      setShowGuideModal(false);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isOromo ? "Amma Bilbila Keerratti Fe'i (One-Tap Install)" : "Install Now on Device"}</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB 2: Direct Public Link (No Google AI Studio frame) */}
            {activeTab === 'public_url' && (
              <div className="space-y-4">
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>{isOromo ? "Liinkii Kallattii Namootaaf Qoodamu" : "Direct Public Web Address"}</span>
                  </div>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    {isOromo
                      ? "Liinkiin kun qoodiinsa barattootaaf kan qophaa'eedha. Google AI Studio fi barruulee teeknikaa hin qabu; websaayitii/appii qulqulluu qofaatu namootaaf bana."
                      : "This link is 100% public and independent. Students and visitors opening this link will see your clean learning platform without the AI Studio editor frame."}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    {isOromo ? "Liinkii Appii Kee (Shared URL):" : "Public App URL:"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={PUBLIC_APP_URL}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        copied ? 'bg-emerald-600 text-white' : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{isOromo ? "Koppii Ta'eera!" : "Copied!"}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{isOromo ? "Koppii Godhi" : "Copy"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <span className="font-bold text-slate-800 block">
                    {isOromo ? "Garaagarummaa URL Lamaanii:" : "Dev URL vs Public URL:"}
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <p>
                      <strong className="text-amber-800 font-semibold">1. `ais-dev-...`:</strong> {isOromo ? "Kun karaa ati keessatti koodii sirreessitu (developer mode) waan ta'eef siif qofa hojjata." : "Only works for you when logged into AI Studio."}
                    </p>
                    <p>
                      <strong className="text-emerald-800 font-semibold">2. `ais-pre-...`:</strong> {isOromo ? "Kun liinkii barattootaa fi ummataati. Namni kamiyyuu login malee bilbilaan bana!" : "Direct public link that anyone can open on mobile or PC."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: APK Generation & Custom Domain */}
            {activeTab === 'apk' && (
              <div className="space-y-4 text-xs">
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 text-indigo-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-700 shrink-0" />
                    <span>{isOromo ? "APK Qopheessuu & Google Play Store" : "Google Play Store & Custom Domain"}</span>
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    {isOromo
                      ? "Appii kana gara faayila APK (Android Application Package) tti jijjiiruun yookaan maqaa domain mataa kee (fakkeenyaaf www.odaacademy.com) itti hidhuuf:"
                      : "How to package this app into an APK file for Google Play Store or point it to your own custom web domain:"}
                  </p>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs mb-1">
                      A. PWABuilder (Salphaa fi Daqiiqaa 2 Keessatti):
                    </h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {isOromo
                        ? "Gara websaayitii pwabuilder.com deemi. Liinkii public armaan olitti jiru galchi. PWABuilder faayila APK fi Google Play Store Package (AAB) siif qopheessa!"
                        : "Go to pwabuilder.com, paste your public URL. It automatically generates a ready-to-publish Google Play APK/AAB package."}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-2.5">
                    <h5 className="font-bold text-slate-800 text-xs mb-1">
                      B. Custom Domain (Hosting):
                    </h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {isOromo
                        ? "Koodii appii kanaa GitHub irratti baastee gara Vercel, Firebase Hosting ykn Cloud Run tti geessuun maqaa websaayitii mataa kee (fakkeenyaaf www.odaacademy.et) itti fe'uu dandeessa."
                        : "You can push the app codebase to GitHub and deploy to Vercel, Firebase Hosting, or Cloud Run with your custom domain name."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                {isOromo ? 'Galeera / Cufi' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

