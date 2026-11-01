import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_LOGO_IMAGE } from '../../data/mockData';
import { GradeLevel } from '../../types';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Smartphone,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { AdminAuthModal } from '../admin/AdminAuthModal';

export const RegistrationScreen: React.FC = () => {
  const { registerStudent, loginStudent, setUserRole, language, setLanguage } = useApp();
  const isOromo = language === 'om';

  // Mode: 'register' | 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    grade: 'Grade 12' as GradeLevel,
    stream: 'Natural Science' as 'Natural Science' | 'Social Science',
    schoolName: '',
    cityOrRegion: 'Finfinnee',
    password: '',
    confirmPassword: '',
    acceptTerms: true,
  });

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Admin Verification Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Errors & notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStreamApplicable =
    formData.grade === 'Grade 11' ||
    formData.grade === 'Grade 12' ||
    formData.grade === 'Freshman Program' ||
    formData.grade === 'Freshman University';

  // Submit Registration (Strict: Validates phone & prevents duplicate accounts)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMsg(isOromo ? 'Maaloo maqaa guutuu galchaa.' : 'Please enter your full name.');
      return;
    }

    const cleanPhoneDigits = formData.phone.replace(/[^0-9]/g, '');
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 9) {
      setErrorMsg(
        isOromo
          ? 'Lakkoofsa bilbilaa sirrii galchaa (fakkeenyaaf: 0911223344 ykn 0711223344).'
          : 'Please enter a valid phone number (at least 9-10 digits).'
      );
      return;
    }

    if (!formData.schoolName.trim()) {
      setErrorMsg(
        isOromo
          ? 'Maaloo maqaa mana barumsaa ykn yuunivarsitii keessanii galchaa.'
          : 'Please specify your school or university name.'
      );
      return;
    }

    if (!formData.cityOrRegion.trim()) {
      setErrorMsg(isOromo ? 'Maaloo magaalaa ykn naannoo keessan galchaa.' : 'Please provide your city or region.');
      return;
    }

    if (!formData.password || formData.password.length < 4) {
      setErrorMsg(isOromo ? 'Jechi icchitii yoo xiqqaate qubee/lakkoofsa 4 ta’uu qaba.' : 'Password must be at least 4 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg(isOromo ? 'Jechi icchitii wal hin simne. Irra deebi’aa ilaalaa.' : 'Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMsg(isOromo ? 'Waliigaltee eegumsa qabiyyee fudhachuu qabdu.' : 'You must accept the in-app DRM terms.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerStudent({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || `${cleanPhoneDigits}@student.oda.edu.et`,
        grade: formData.grade,
        stream: isStreamApplicable ? formData.stream : undefined,
        schoolName: formData.schoolName.trim(),
        cityOrRegion: formData.cityOrRegion.trim(),
        password: formData.password,
      });

      if (!result.success) {
        setErrorMsg(result.error || (isOromo ? 'Dogoggorri galmee uumameera.' : 'Registration error occurred.'));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginIdentifier.trim()) {
      setErrorMsg(isOromo ? 'Lakkoofsa bilbilaa ykn imeelii galchaa.' : 'Please enter your phone number or email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginStudent(loginIdentifier.trim(), loginPassword);
      if (!result.success) {
        setErrorMsg(
          result.error ||
            (isOromo
              ? "Herregni hin argamne. Maaloo dura galmee xumuraa (Register)."
              : 'Account not found. Please register first.')
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Bar with Language switcher & Admin gateway */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Play Store App Edition</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(isOromo ? 'en' : 'om')}
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-500 text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span>🌐</span>
            <span>{isOromo ? 'Afaan Oromoo' : 'English'}</span>
          </button>

          {/* Secure Admin Access via Verified Owner Modal */}
          <button
            onClick={() => setShowAdminModal(true)}
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
            title="Administrator portal (Owner verification required)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isOromo ? 'Seensa Bulchaa (Admin)' : 'Admin Portal'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto my-auto">
        <div className="bg-slate-900/90 border border-emerald-500/25 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          {/* Logo & Header */}
          <div className="text-center pb-6 border-b border-slate-800">
            <div className="relative inline-block mx-auto mb-3">
              <img
                src={APP_LOGO_IMAGE}
                alt="ODA TUTORIAL CLASS"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto object-contain shadow-lg ring-4 ring-emerald-500/40 p-1 bg-slate-950"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-md">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            <h1 className="font-classical-serif text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-wide">
              ODA TUTORIAL CLASS
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isOromo
                ? 'Appilikeeshinii Barnootaa Kutaa 9–12 fi Sadarkaa Yuunivarsitii'
                : 'Educational Learning Platform for Grades 9–12 & University Freshman'}
            </p>
          </div>

          {/* Mandatory Registration Notice */}
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/40 flex items-start gap-3 shadow-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-200">
                {isOromo ? 'Dirqama: Galmee Barataa Guutaa' : 'Mandatory Student Registration'}
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {isOromo
                  ? 'Appilikeeshinii kana fayyadamuuf dursa galmee barataa guutuu qabdu. Galmee booda kutaalee fi qabiyyee barnootaa ilaaluu dandeessu.'
                  : 'All students must complete registration before accessing learning pages. Fill in your details to create your student account.'}
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 rounded-xl mt-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isOromo ? 'Galmee Haaraa (Register)' : 'New Student Registration'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isOromo ? 'Seeni (Sign In)' : 'Sign In'}
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Content */}
          {authMode === 'register' ? (
            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isOromo ? 'Maqaa Guutuu Barataa / Barattuu' : 'Student Full Name'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isOromo ? 'Fkn: Caalaa Tolasaa / Chala Tolossa' : 'e.g. Chala Tolossa'}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isOromo ? 'Lakkoofsa Bilbilaa' : 'Phone Number'} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0911223344"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isOromo ? 'Imeelii (Email Yoo Jiraate)' : 'Email (Optional)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@example.com"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Education Program & Grade Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isOromo ? 'Kutaa Barumsaa (Grade or Program)' : 'Grade or Education Program'} *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Freshman Program'] as GradeLevel[]).map(
                    grade => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => setFormData({ ...formData, grade })}
                        className={`py-2 px-1.5 rounded-lg text-xs font-bold border transition-all text-center ${
                          formData.grade === grade
                            ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-sm ring-1 ring-emerald-400'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {grade === 'Freshman Program' ? 'Freshman' : grade.replace('Grade ', 'G-')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Stream Selection (Natural vs Social Science) when applicable */}
              {isStreamApplicable && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isOromo ? 'Gosa Barnootaa (Stream / Field)' : 'Academic Stream'} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stream: 'Natural Science' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                        formData.stream === 'Natural Science'
                          ? 'bg-sky-600/25 border-sky-400 text-sky-300 shadow-sm'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🧪 Natural Science
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stream: 'Social Science' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                        formData.stream === 'Social Science'
                          ? 'bg-amber-600/25 border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ⚖️ Social Science
                    </button>
                  </div>
                </div>
              )}

              {/* School and City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isOromo ? 'Mana Barumsaa / Yuunivarsitii' : 'School / University'} *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.schoolName}
                      onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                      placeholder={isOromo ? 'Fkn: Oda Special Boarding' : 'e.g. Oda Secondary School'}
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isOromo ? 'Magaalaa / Naannoo' : 'City / Region'} *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={formData.cityOrRegion}
                      onChange={e => setFormData({ ...formData, cityOrRegion: e.target.value })}
                      placeholder="Finfinnee / Adama / Hawassa / Jimma"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isOromo ? 'Jecha Icchitii (Password)' : 'Password'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isOromo ? 'Jecha Icchitii Mirkaneessi' : 'Confirm Password'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* DRM & In-App Content Protection Acceptance */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={e => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="leading-relaxed">
                    <span className="font-semibold text-emerald-400">
                      {isOromo ? 'Eegumsa Qabiyyee fi Waliigaltee Barataa:' : 'In-App Content Protection & Terms:'}
                    </span>{' '}
                    {isOromo
                      ? 'Waraabbii fi viidiyoon appilikeeshinii keessatti qofa kan daawwatamu ta’uu, gara kuusaa bilbilaatti hin buune, akkasumas screenshot fi screen record dhowwaa ta’uu nan beeka.'
                      : 'I acknowledge all materials (video, notes, quizzes) are viewable inside the application only, not downloadable to external device storage, with screen recording prohibited.'}
                  </div>
                </label>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? isOromo
                      ? 'Galmeessaa jira...'
                      : 'Registering...'
                    : isOromo
                    ? 'Galmee Xumuri & Barnoota Jalqabi'
                    : 'Complete Registration & Start Learning'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isOromo ? 'Lakkoofsa Bilbilaa ykn Imeelii' : 'Phone Number or Email'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="0911223344 / student@gmail.com"
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isOromo ? 'Jecha Icchitii (Password)' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? isOromo
                      ? 'Ilaalamaa jira...'
                      : 'Signing In...'
                    : isOromo
                    ? 'Seeni (Sign In)'
                    : 'Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  {isOromo ? 'Herrega hin qabduu? Asitti galmaa’aa' : "Don't have an account? Register here"}
                </button>
              </div>
            </form>
          )}

          {/* Key Features Trust Badges */}
          <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>DRM Protected</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Full Curriculum</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Owner Verification Modal */}
      <AdminAuthModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={() => {
          setShowAdminModal(false);
          setUserRole('admin');
        }}
      />

      {/* Footer */}
      <div className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 pt-4">
        ODA TUTORIAL CLASS · Official Ethiopian Secondary & University Educational System
      </div>
    </div>
  );
};
