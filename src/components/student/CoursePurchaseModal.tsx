import React, { useState, useMemo } from 'react';
import { Subject, GradeLevel, PaymentSubmission, PaymentMethodConfig } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Check,
  Upload,
  Copy,
  ShieldAlert,
  Sparkles,
  FileText,
  Tag,
  Clock,
  Layers,
  BookOpen,
  CheckSquare,
  Square,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PAYMENT_RECEIPT_IMAGE } from '../../data/mockData';

interface CoursePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGrade?: GradeLevel;
  initialSelectedSubjectId?: string;
}

export const CoursePurchaseModal: React.FC<CoursePurchaseModalProps> = ({
  isOpen,
  onClose,
  targetGrade,
  initialSelectedSubjectId,
}) => {
  const { currentStudent, subjects, paymentSettings, submitPayment, language, checkSubjectAccess } = useApp();
  const isOromo = language === 'om';

  const effectiveGrade = targetGrade || currentStudent.grade || 'Grade 12';

  // Available subjects for this grade
  const gradeSubjects = useMemo(() => {
    return subjects.filter(s => s.grade === effectiveGrade);
  }, [subjects, effectiveGrade]);

  // Two Options: 'package' (Option A: All Subjects) vs 'individual' (Option B: Select Individual Subjects)
  const [purchaseOption, setPurchaseOption] = useState<'package' | 'individual'>(
    initialSelectedSubjectId ? 'individual' : 'package'
  );

  // Selected individual subject IDs
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(() => {
    if (initialSelectedSubjectId) return [initialSelectedSubjectId];
    if (gradeSubjects.length > 0) return [gradeSubjects[0].id];
    return [];
  });

  // Selected Payment Gateway
  const paymentMethods: PaymentMethodConfig[] = useMemo(() => {
    if (paymentSettings?.paymentMethods && paymentSettings.paymentMethods.length > 0) {
      return paymentSettings.paymentMethods.filter(m => m.isEnabled);
    }
    return [
      {
        id: 'pm-tb',
        name: 'Telebirr',
        provider: 'Telebirr',
        accountNumber: '+251 91 123 4567',
        accountName: 'Oda Educational Services (Merchant ID: 884920)',
        instructions: 'Kaffaltii Telebirr erga raawwattanii booda lakkofsa daddabarsaa fi screenshot nagahee dhiyeessaa.',
        isEnabled: true,
      },
      {
        id: 'pm-cbe',
        name: 'Commercial Bank of Ethiopia (CBE)',
        provider: 'Commercial Bank of Ethiopia (CBE)',
        accountNumber: '1000 2938 4729 1',
        accountName: 'Oda Education & Learning Systems',
        instructions: 'Herrega Baankii Daldala Itiyoophiyaa (CBE) irratti kaffaluun lakkofsa FT nagahee dhiyeessaa.',
        isEnabled: true,
      },
    ];
  }, [paymentSettings]);

  const [selectedMethodId, setSelectedMethodId] = useState<string>(() => {
    return paymentMethods[0]?.id || 'pm-tb';
  });

  // Form input fields
  const [referenceNumber, setReferenceNumber] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [screenshotPreview, setScreenshotPreview] = useState<string>(PAYMENT_RECEIPT_IMAGE);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Package pricing from settings or default
  const packagePriceConfig = useMemo(() => {
    const pkg = paymentSettings?.gradePackages?.[effectiveGrade];
    if (pkg) {
      return {
        priceETB: pkg.allSubjectsPriceETB,
        priceUSD: pkg.allSubjectsPriceUSD,
        durationDays: pkg.durationDays || 180,
      };
    }
    const defaults: Record<string, { priceETB: number; priceUSD: number }> = {
      'Grade 9': { priceETB: 700, priceUSD: 15 },
      'Grade 10': { priceETB: 800, priceUSD: 18 },
      'Grade 11': { priceETB: 950, priceUSD: 22 },
      'Grade 12': { priceETB: 1050, priceUSD: 25 },
      'Freshman Program': { priceETB: 1300, priceUSD: 30 },
      'Freshman University': { priceETB: 1300, priceUSD: 30 },
    };
    return { ...(defaults[effectiveGrade] || { priceETB: 900, priceUSD: 20 }), durationDays: 180 };
  }, [paymentSettings, effectiveGrade]);

  // Helper to get individual subject price
  const getSubjectPrice = (sub: Subject) => {
    const override = paymentSettings?.subjectPrices?.[sub.id];
    if (override) {
      return { priceETB: override.priceETB, priceUSD: override.priceUSD };
    }
    return { priceETB: sub.priceETB || 200, priceUSD: sub.priceUSD || 5 };
  };

  // Live total calculation
  const { rawPriceETB, rawPriceUSD, discountETB, finalPriceETB, finalPriceUSD } = useMemo(() => {
    let rawETB = 0;
    let rawUSD = 0;

    if (purchaseOption === 'package') {
      rawETB = packagePriceConfig.priceETB;
      rawUSD = packagePriceConfig.priceUSD;
    } else {
      for (const subId of selectedSubjectIds) {
        const sub = gradeSubjects.find(s => s.id === subId);
        if (sub) {
          const prices = getSubjectPrice(sub);
          rawETB += prices.priceETB;
          rawUSD += prices.priceUSD;
        }
      }
    }

    let disc = 0;
    if (appliedPromo) {
      disc = Math.round((rawETB * appliedPromo.percent) / 100);
    }

    const finETB = Math.max(0, rawETB - disc);
    const finUSD = Math.max(0, rawUSD - Math.round((rawUSD * (appliedPromo?.percent || 0)) / 100));

    return {
      rawPriceETB: rawETB,
      rawPriceUSD: rawUSD,
      discountETB: disc,
      finalPriceETB: finETB,
      finalPriceUSD: finUSD,
    };
  }, [purchaseOption, selectedSubjectIds, gradeSubjects, packagePriceConfig, appliedPromo, paymentSettings]);

  if (!isOpen) return null;

  const activeMethod = paymentMethods.find(m => m.id === selectedMethodId) || paymentMethods[0];

  const handleCopyAccount = () => {
    if (activeMethod?.accountNumber) {
      navigator.clipboard.writeText(activeMethod.accountNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleToggleSubject = (subId: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const handleSelectAllIndividual = () => {
    setSelectedSubjectIds(gradeSubjects.map(s => s.id));
  };

  const handleDeselectAllIndividual = () => {
    setSelectedSubjectIds([]);
  };

  const handleApplyPromo = () => {
    setPromoError(null);
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) return;

    const availablePromos = paymentSettings?.promotions || [
      { id: '1', code: 'ODA2026', discountPercent: 15, isActive: true },
      { id: '2', code: 'STUDENT10', discountPercent: 10, isActive: true },
    ];

    const match = availablePromos.find(p => p.code.toUpperCase() === clean && p.isActive);
    if (match) {
      setAppliedPromo({ code: match.code, percent: match.discountPercent });
      setPromoCodeInput('');
    } else {
      setPromoError(isOromo ? 'Koodiin kun hin hojjetu ykn darbeera.' : 'Invalid or expired promo code.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit payment transaction
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (purchaseOption === 'individual' && selectedSubjectIds.length === 0) {
      setSubmitError(
        isOromo
          ? 'Maaloo yoo xiqqaate gosa barnootaa tokko filadhaa.'
          : 'Please select at least one subject to proceed.'
      );
      return;
    }

    if (!referenceNumber.trim()) {
      setSubmitError(
        isOromo
          ? 'Lakkofsa daddabarsaa (Reference/FT Number) galchaa.'
          : 'Please enter transaction reference number.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTitles =
        purchaseOption === 'package'
          ? gradeSubjects.map(s => s.title)
          : selectedSubjectIds.map(id => gradeSubjects.find(s => s.id === id)?.title || id);

      const subjectIdSummary =
        purchaseOption === 'package' ? `pkg-${effectiveGrade.replace(/\s+/g, '-').toLowerCase()}` : selectedSubjectIds.join(',');

      const titleSummary =
        purchaseOption === 'package'
          ? `${effectiveGrade} All Subjects Package`
          : selectedTitles.join(', ');

      await submitPayment({
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        studentEmail: currentStudent.email,
        studentPhone: currentStudent.phone,
        purchaseType: purchaseOption === 'package' ? 'all_subjects_package' : 'individual_subjects',
        subjectId: subjectIdSummary,
        subjectTitle: titleSummary,
        subjectIds: purchaseOption === 'package' ? gradeSubjects.map(s => s.id) : selectedSubjectIds,
        subjectTitles: selectedTitles,
        grade: effectiveGrade,
        amountETB: finalPriceETB,
        amountUSD: finalPriceUSD,
        discountAppliedETB: discountETB,
        promoCodeUsed: appliedPromo?.code,
        paymentMethod: activeMethod?.name || 'Telebirr',
        referenceNumber: referenceNumber.trim(),
        screenshotUrl: screenshotPreview || PAYMENT_RECEIPT_IMAGE,
      });

      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Payment submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/30">
              💎
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-white">
                {isOromo ? 'Qabiyyee Koorsoo Premiyeemii Bani' : 'Unlock Premium Course Access'}
              </h3>
              <p className="text-xs text-slate-300">
                {effectiveGrade} · {gradeSubjects.length} {isOromo ? 'Gosa Barnootaa' : 'Subjects Available'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitSuccess ? (
          /* SUCCESS CONFIRMATION SCREEN */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h4 className="text-xl font-extrabold text-slate-900">
              {isOromo ? 'Nagaheen Kaffaltii Keessanii Ergameera!' : 'Payment Verification Submitted!'}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {isOromo
                ? `Lakkofsi daddabarsaa (${referenceNumber}) fi nagaheen kaffaltii qabiyyee (${
                    purchaseOption === 'package' ? 'All Subjects Package' : `${selectedSubjectIds.length} Subjects`
                  }) sirritti ol-kaa'ameera. Bulchaan (Mr. Oda) nagahee keessan ilaalee battalumatti qabiyyee isiniif bana.`
                : `Your transaction receipt for ${
                    purchaseOption === 'package' ? 'All Subjects Package' : `${selectedSubjectIds.length} Subjects`
                  } has been sent. Admin Mr. Oda will review and verify your transfer shortly to activate course access.`}
            </p>

            <div className="p-3.5 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{isOromo ? 'Adeemsa Mirkaneessaa:' : 'Strict Verification Process:'}</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {isOromo
                  ? 'Qabiyyeen kan banamu kaffaltiin yoo mirkanaa\'e qofa. Cuqaasuu qofaan hin banamu. Mr. Oda daqiiqaa 15–30 keessatti ni mirkaneessa.'
                  : 'Access activates strictly after administrator verification of the bank slip. Buttons or uploads alone do not unlock courses.'}
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                {isOromo ? 'Gara Barnootaatti Deebi\'i' : 'Done & Return to Courses'}
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <form onSubmit={handleSubmitTransaction} className="p-6 space-y-6">
            {submitError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* TWO COURSE PURCHASE OPTIONS TABS */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                {isOromo ? 'Gosa Kaffaltii Filadhaa (Course Purchase Options):' : 'Choose Course Purchase Option:'}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* OPTION A: ALL SUBJECTS PACKAGE */}
                <div
                  onClick={() => setPurchaseOption('package')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    purchaseOption === 'package'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        OPTION A · BEST VALUE
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          purchaseOption === 'package'
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {purchaseOption === 'package' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {isOromo ? 'Paakeejii Barnoota Hundaa' : 'All Subjects Package'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {isOromo
                        ? `Kutaa ${effectiveGrade} keessatti gosa barnootaa hundumaa (${gradeSubjects.length}) yeroo tokkotti argadhaa.`
                        : `Complete package: all ${gradeSubjects.length} subjects in ${effectiveGrade} included together.`}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-baseline justify-between">
                    <span className="text-base font-extrabold text-indigo-900 font-mono-numbers">
                      {packagePriceConfig.priceETB} ETB
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ($ {packagePriceConfig.priceUSD} USD)
                    </span>
                  </div>
                </div>

                {/* OPTION B: SELECT INDIVIDUAL SUBJECTS */}
                <div
                  onClick={() => setPurchaseOption('individual')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    purchaseOption === 'individual'
                      ? 'border-sky-600 bg-sky-50/50 shadow-sm ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        OPTION B · FLEXIBLE
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          purchaseOption === 'individual'
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {purchaseOption === 'individual' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {isOromo ? 'Gosa Barnootaa Addaan Filadhu' : 'Select Individual Subjects'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {isOromo
                        ? 'Gosa barnootaa barbaaddan qofa mallattoo gochuun kaffaltii dabalataa dhiisaa.'
                        : 'Pick only the exact courses you need. Price automatically recalculates with each checkbox.'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-sky-900">
                      {selectedSubjectIds.length} {isOromo ? 'Filatame' : 'Selected'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">
                      ~150–280 ETB / each
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTION B SUBJECT SELECTION CHECKBOXES */}
            {purchaseOption === 'individual' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {isOromo ? 'Gosa Barnootaa Barbaaddan Filadhaa:' : 'Select Subjects to Enroll:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllIndividual}
                      className="text-[10px] font-bold text-sky-700 hover:underline"
                    >
                      {isOromo ? 'Hundumaa Fili' : 'Select All'}
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllIndividual}
                      className="text-[10px] font-bold text-slate-500 hover:underline"
                    >
                      {isOromo ? 'Haquu' : 'Clear'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {gradeSubjects.map(sub => {
                    const isChecked = selectedSubjectIds.includes(sub.id);
                    const subPrice = getSubjectPrice(sub);

                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleToggleSubject(sub.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white border-sky-400 shadow-2xs font-bold text-slate-900'
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{sub.title}</span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-800 shrink-0 ml-2">
                          {subPrice.priceETB} ETB
                        </span>
                      </div>
                    );
                  })}
                </div>

                {selectedSubjectIds.length === 0 && (
                  <p className="text-[11px] text-amber-700 font-semibold text-center py-1">
                    ⚠️ {isOromo ? 'Maaloo yoo xiqqaate gosa barnootaa tokko filadhaa' : 'Please select at least 1 subject to proceed.'}
                  </p>
                )}
              </div>
            )}

            {/* DYNAMIC PRICE SUMMARY BANNER */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-850 rounded-xl text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  {purchaseOption === 'package' ? 'PACKAGE TOTAL' : `${selectedSubjectIds.length} SUBJECTS COMBINED`}
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black font-mono-numbers text-white">
                    {finalPriceETB} ETB
                  </span>
                  {discountETB > 0 && (
                    <span className="text-xs line-through text-slate-400 font-mono-numbers">
                      {rawPriceETB} ETB
                    </span>
                  )}
                  <span className="text-xs text-slate-400">($ {finalPriceUSD} USD)</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-emerald-400 font-bold block">
                  {purchaseOption === 'package'
                    ? `All ${gradeSubjects.length} Courses Unlocked`
                    : `${selectedSubjectIds.length} Courses Unlocked`}
                </span>
                <span className="text-[10px] text-slate-400">
                  {packagePriceConfig.durationDays} Days Full Access
                </span>
              </div>
            </div>

            {/* PROMO CODE INPUT */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={isOromo ? 'Koodii Eebbaa (fkn: ODA2026)' : 'Promo Code (e.g. ODA2026)'}
                  value={promoCodeInput}
                  onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {isOromo ? 'Hojiirra Oolchi' : 'Apply'}
              </button>
            </div>
            {appliedPromo && (
              <p className="text-[11px] text-emerald-600 font-bold">
                ✓ {appliedPromo.code} applied ({appliedPromo.percent}% discount saved: {discountETB} ETB)
              </p>
            )}
            {promoError && <p className="text-[11px] text-rose-600">{promoError}</p>}

            {/* PAYMENT METHOD SELECTION */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                {isOromo ? 'Mala Kaffaltii Filadhaa (Payment Gateway):' : 'Select Payment Gateway:'}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedMethodId === method.id
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block truncate">{method.name}</span>
                    <span className="text-[10px] text-slate-500">{method.provider}</span>
                  </button>
                ))}
              </div>

              {/* Active Gateway Account Details & Copy */}
              {activeMethod && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {isOromo ? 'Lakkoofsa Herregaa / Daldalaa' : 'Account / Merchant Number'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {activeMethod.accountNumber}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 border-t border-slate-200 pt-1.5 leading-relaxed">
                    {activeMethod.instructions}
                  </p>
                </div>
              )}
            </div>

            {/* TRANSACTION REFERENCE & PROOF SCREENSHOT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isOromo ? 'Lakkofsa Daddabarsaa (Reference / FT Number) *' : 'Transaction Reference / FT Number *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="TB-8849201948 or FT262849182910"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {isOromo ? 'Nagahee / Screenshot Kaffaltii' : 'Payment Slip Screenshot'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* STRICT VERIFICATION DISCLAIMER */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>{isOromo ? 'Hubachiisa Eegumsaa:' : 'Verification Notice:'}</strong>{' '}
                {isOromo
                  ? 'Qabiyyeen barnootaa kan banamu erga bulchaan (Mr. Oda) nagahee keessan mirkaneesse qofa. Kaffaltiin sobaa fi nagaheen irra deebii battalumatti kufaa ta’a.'
                  : 'Premium courses are unlocked only upon backend verification by Admin Mr. Oda. Clicking submit or uploading a slip does not grant immediate bypass.'}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting || (purchaseOption === 'individual' && selectedSubjectIds.length === 0)}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? isOromo
                    ? 'Nagaheen dhihaachaa jira...'
                    : 'Submitting Receipt...'
                  : isOromo
                  ? `Kaffaltii Dhiyeessi (${finalPriceETB} ETB)`
                  : `Submit Payment Verification (${finalPriceETB} ETB)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
