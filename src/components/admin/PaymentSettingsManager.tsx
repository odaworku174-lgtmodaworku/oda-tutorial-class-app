import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, PaymentSettings, GradePackagePricing, PaymentMethodConfig, PromoDiscount } from '../../types';
import {
  CreditCard,
  DollarSign,
  Tag,
  Clock,
  ShieldCheck,
  Check,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Calendar,
  Layers,
  History,
  Sparkles,
} from 'lucide-react';

export const PaymentSettingsManager: React.FC = () => {
  const { paymentSettings, updatePaymentSettings, subjects, auditLogs, refreshAuditLogs, language } = useApp();
  const isOromo = language === 'om';

  const [activeTab, setActiveTab] = useState<'packages' | 'subjects' | 'methods' | 'promos' | 'durations' | 'audit'>('packages');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Local draft state initialized from context
  const [settingsDraft, setSettingsDraft] = useState<PaymentSettings>(() => {
    if (paymentSettings) return JSON.parse(JSON.stringify(paymentSettings));
    return {
      gradePackages: {
        'Grade 9': { grade: 'Grade 9', allSubjectsPriceETB: 700, allSubjectsPriceUSD: 15, isActive: true, durationLabel: 'Semester (6 Months)', durationDays: 180 },
        'Grade 10': { grade: 'Grade 10', allSubjectsPriceETB: 800, allSubjectsPriceUSD: 18, isActive: true, durationLabel: 'Semester (6 Months)', durationDays: 180 },
        'Grade 11': { grade: 'Grade 11', allSubjectsPriceETB: 950, allSubjectsPriceUSD: 22, isActive: true, durationLabel: 'Semester (6 Months)', durationDays: 180 },
        'Grade 12': { grade: 'Grade 12', allSubjectsPriceETB: 1050, allSubjectsPriceUSD: 25, isActive: true, durationLabel: 'Semester (6 Months)', durationDays: 180 },
        'Freshman Program': { grade: 'Freshman Program', allSubjectsPriceETB: 1300, allSubjectsPriceUSD: 30, isActive: true, durationLabel: 'Semester (6 Months)', durationDays: 180 },
        'Freshman University': { grade: 'Freshman University', allSubjectsPriceETB: 1300, allSubjectsPriceUSD: 30, isActive: true, durationLabel: 'Semester (6 Months)', durationDays: 180 },
      },
      subjectPrices: {},
      paymentMethods: [
        {
          id: 'pm-telebirr',
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
        {
          id: 'pm-awash',
          name: 'Awash Bank',
          provider: 'Awash Bank',
          accountNumber: '0143 8928 4721 00',
          accountName: 'Oda Educational Software Systems',
          instructions: 'Baankii Hawaash (Awash Birr / Mobile Banking) fayyadamuun kaffaltii raawwadhaa.',
          isEnabled: true,
        },
      ],
      promotions: [
        { id: 'promo-oda2026', code: 'ODA2026', discountPercent: 15, description: 'Gurgurtaa Addaa Jalqaba Waggaa (15% Off)', isActive: true },
      ],
      subscriptionDurations: [
        { id: 'dur-30', label: '1 Month (30 Days)', labelOromo: "Ji'a 1 (Guyyaa 30)", days: 30 },
        { id: 'dur-180', label: 'Semester (6 Months)', labelOromo: "Simisteera 1 (Ji'a 6)", days: 180, isDefault: true },
        { id: 'dur-365', label: 'Full Academic Year (1 Year)', labelOromo: 'Waggaa Barnootaa Guutuu', days: 365 },
        { id: 'dur-lifetime', label: 'Lifetime Access', labelOromo: 'Yeroo Hundaa (Lifetime)', days: 3650 },
      ],
      activeAcademicYear: '2025/2026 E.C.',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Mr. Oda Worku (odaworku174@gmail.com)',
    };
  });

  // Re-sync if context updates
  React.useEffect(() => {
    if (paymentSettings) {
      setSettingsDraft(JSON.parse(JSON.stringify(paymentSettings)));
    }
  }, [paymentSettings]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const ok = await updatePaymentSettings(settingsDraft);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMsg('Dogoggorri kuusaa kaffaltii irratti uumameera.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to save payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Grade package price change
  const handlePackagePriceChange = (grade: GradeLevel, field: 'allSubjectsPriceETB' | 'allSubjectsPriceUSD' | 'durationDays', val: number) => {
    setSettingsDraft(prev => {
      const updated = { ...prev };
      if (!updated.gradePackages[grade]) {
        updated.gradePackages[grade] = {
          grade,
          allSubjectsPriceETB: 800,
          allSubjectsPriceUSD: 20,
          isActive: true,
          durationLabel: 'Semester (6 Months)',
          durationDays: 180,
        };
      }
      updated.gradePackages[grade] = {
        ...updated.gradePackages[grade],
        [field]: Number(val) || 0,
      };
      return updated;
    });
  };

  // Individual subject price change
  const handleSubjectPriceChange = (subjectId: string, field: 'priceETB' | 'priceUSD', val: number) => {
    setSettingsDraft(prev => {
      const updated = { ...prev };
      const current = updated.subjectPrices[subjectId] || { priceETB: 200, priceUSD: 5 };
      updated.subjectPrices[subjectId] = {
        ...current,
        [field]: Number(val) || 0,
      };
      return updated;
    });
  };

  // Toggle payment method active state
  const handleToggleMethod = (methodId: string) => {
    setSettingsDraft(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(m =>
        m.id === methodId ? { ...m, isEnabled: !m.isEnabled } : m
      ),
    }));
  };

  // Edit payment method details
  const handleUpdateMethod = (methodId: string, field: keyof PaymentMethodConfig, val: any) => {
    setSettingsDraft(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(m =>
        m.id === methodId ? { ...m, [field]: val } : m
      ),
    }));
  };

  // Add promo discount
  const handleAddPromo = () => {
    const newPromo: PromoDiscount = {
      id: `promo-${Date.now().toString().slice(-5)}`,
      code: `DISCOUNT${Math.floor(Math.random() * 90 + 10)}`,
      discountPercent: 10,
      description: 'Special promotion discount',
      isActive: true,
    };
    setSettingsDraft(prev => ({
      ...prev,
      promotions: [newPromo, ...prev.promotions],
    }));
  };

  const handleRemovePromo = (promoId: string) => {
    setSettingsDraft(prev => ({
      ...prev,
      promotions: prev.promotions.filter(p => p.id !== promoId),
    }));
  };

  const GRADES_LIST: GradeLevel[] = [
    'Grade 9',
    'Grade 10',
    'Grade 11',
    'Grade 12',
    'Freshman Program',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Save Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
            <CreditCard className="w-4 h-4" />
            <span>OWNER FINANCIAL GOVERNANCE & PRICING</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Course Pricing, Packages & Payment Gateway Settings
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Configure All-Subjects package prices, individual subject fees, Ethiopian payment gateways (Telebirr, CBE, Awash), discounts, and view the access audit log.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-lg animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Milkaa'inaan Kuufameera!</span>
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Kuusaa jira...' : 'Save Settings to Database'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl overflow-x-auto border border-slate-200">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'packages'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Grade Package Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'subjects'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-sky-600" />
          <span>Individual Subject Prices</span>
        </button>

        <button
          onClick={() => setActiveTab('methods')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'methods'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Payment Gateways (Telebirr/CBE)</span>
        </button>

        <button
          onClick={() => setActiveTab('promos')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'promos'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-600" />
          <span>Promotions & Coupons</span>
        </button>

        <button
          onClick={() => setActiveTab('durations')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'durations'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>Subscription Durations</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('audit');
            refreshAuditLogs();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-purple-600" />
          <span>Access Audit Log</span>
        </button>
      </div>

      {/* TAB 1: ALL-SUBJECTS PACKAGE PRICING */}
      {activeTab === 'packages' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Option A: Complete All-Subjects Package Pricing
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Set the discounted bundle price for students who enroll in all subjects together for each grade or program.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {GRADES_LIST.map(grade => {
              const pkg = settingsDraft.gradePackages[grade] || {
                grade,
                allSubjectsPriceETB: 800,
                allSubjectsPriceUSD: 20,
                isActive: true,
                durationLabel: 'Semester (6 Months)',
                durationDays: 180,
              };

              const subjectsInGrade = subjects.filter(s => s.grade === grade);

              return (
                <div
                  key={grade}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-slate-900">{grade}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {subjectsInGrade.length} Subjects Included
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Package Price (ETB) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={pkg.allSubjectsPriceETB}
                            onChange={e => handlePackagePriceChange(grade, 'allSubjectsPriceETB', parseFloat(e.target.value))}
                            className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-lg pl-3 pr-12 py-2 text-xs font-bold font-mono-numbers text-slate-900 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">ETB</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          International Price (USD)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={pkg.allSubjectsPriceUSD}
                            onChange={e => handlePackagePriceChange(grade, 'allSubjectsPriceUSD', parseFloat(e.target.value))}
                            className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-lg pl-3 pr-12 py-2 text-xs font-bold font-mono-numbers text-slate-900 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">USD</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Duration (Days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={pkg.durationDays || 180}
                          onChange={e => handlePackagePriceChange(grade, 'durationDays', parseInt(e.target.value, 10))}
                          className="w-full bg-white border border-slate-300 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-mono-numbers text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
                    Includes: {subjectsInGrade.map(s => s.title.replace(/\s*\(.*\)/, '')).join(', ') || 'All subjects'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL SUBJECT PRICES */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Option B: Individual Subject Fees (Single Course Selection)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Students who only need 1 or 2 specific subjects can select checkboxes. These fees calculate live in the student checkout screen.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {GRADES_LIST.map(grade => {
              const gradeSubs = subjects.filter(s => s.grade === grade);
              if (gradeSubs.length === 0) return null;

              return (
                <div key={grade} className="py-5 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{grade}</span>
                    <span className="h-px bg-slate-200 flex-1"></span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gradeSubs.map(sub => {
                      const dynamicPrice = settingsDraft.subjectPrices[sub.id] || {
                        priceETB: sub.priceETB,
                        priceUSD: sub.priceUSD,
                      };

                      return (
                        <div
                          key={sub.id}
                          className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{sub.title}</h4>
                            <span className="text-[10px] text-slate-500">{sub.stream || 'General'}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-20">
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  step="10"
                                  value={dynamicPrice.priceETB}
                                  onChange={e => handleSubjectPriceChange(sub.id, 'priceETB', parseFloat(e.target.value))}
                                  className="w-full bg-white border border-slate-300 focus:border-sky-500 rounded-md px-2 py-1 text-xs font-bold font-mono-numbers text-slate-900 text-right pr-7 focus:outline-none"
                                />
                                <span className="absolute right-1.5 top-1 text-[10px] text-slate-400 font-bold">ETB</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT GATEWAYS & ACCOUNTS */}
      {activeTab === 'methods' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Ethiopian Payment Gateways & Receiving Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enable or disable specific payment methods, update merchant numbers, bank account numbers, and payment instruction notes.
            </p>
          </div>

          <div className="space-y-5">
            {settingsDraft.paymentMethods.map(method => (
              <div
                key={method.id}
                className={`p-5 rounded-xl border transition-all ${
                  method.isEnabled
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-slate-100/50 border-dashed border-slate-300 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center font-bold text-base text-slate-800">
                      {method.name.includes('Telebirr') ? '📱' : method.name.includes('CBE') ? '🏦' : '💳'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{method.name}</h4>
                      <span className="text-[10px] text-slate-500">{method.provider}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleMethod(method.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      method.isEnabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {method.isEnabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                    <span>{method.isEnabled ? 'Active & Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account / Merchant Number *
                    </label>
                    <input
                      type="text"
                      value={method.accountNumber}
                      onChange={e => handleUpdateMethod(method.id, 'accountNumber', e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account / Beneficiary Name *
                    </label>
                    <input
                      type="text"
                      value={method.accountName}
                      onChange={e => handleUpdateMethod(method.id, 'accountName', e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Instructions for Student
                    </label>
                    <textarea
                      rows={2}
                      value={method.instructions}
                      onChange={e => handleUpdateMethod(method.id, 'instructions', e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROMOTIONS & DISCOUNTS */}
      {activeTab === 'promos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Promotional Offers & Coupon Codes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Create promotional discount codes that students can type at checkout to receive price reductions.
              </p>
            </div>
            <button
              onClick={handleAddPromo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Promo Code</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {settingsDraft.promotions.map(promo => (
              <div
                key={promo.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                    <Tag className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{promo.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {promo.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{promo.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={promo.discountPercent}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setSettingsDraft(prev => ({
                        ...prev,
                        promotions: prev.promotions.map(p =>
                          p.id === promo.id ? { ...p, discountPercent: val } : p
                        ),
                      }));
                    }}
                    className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-bold text-right"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>

                  <button
                    onClick={() => handleRemovePromo(promo.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUBSCRIPTION DURATIONS */}
      {activeTab === 'durations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Course Subscription Durations & Expiration Windows
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure how long premium access remains unlocked when an admin approves a payment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settingsDraft.subscriptionDurations.map(dur => (
              <div
                key={dur.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{dur.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{dur.labelOromo}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-700">{dur.days} Days</span>
                  {dur.isDefault && (
                    <span className="block text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5">
                      Default Semester
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ACCESS AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Administrative Governance & Access Audit Log
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Immutable records of all manual approvals, rejections, course price adjustments, and manual access grants.
              </p>
            </div>
            <button
              onClick={refreshAuditLogs}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Target / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400">
                      No administrative audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'APPROVE_PAYMENT' || log.action === 'GRANT_ACCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.action === 'REJECT_PAYMENT' || log.action === 'REVOKE_ACCESS'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-medium text-slate-900">
                        {log.actorName || log.actorEmail}
                      </td>
                      <td className="p-3 text-slate-700">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
