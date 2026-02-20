import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from './ui/Button';
import { UserSettings, GuardianMode, Currency, Holiday, Language, Theme } from '../types';
import { URUGUAY_HOLIDAYS_2024 } from '../utils/holidays';
import { Calendar } from './ui/Calendar';
import { Globe, Calendar as CalendarIcon, Bot, Palette, Check, Sun, Moon, Briefcase, Zap } from 'lucide-react';

export const SetupScreen: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [step, setStep] = useState(1);
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  const handleUpdate = (key: keyof UserSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleHoliday = (dateStr: string) => {
    const exists = localSettings.customHolidays.find(h => h.date === dateStr);
    let updatedHolidays;

    if (exists) {
      // Remove it
      updatedHolidays = localSettings.customHolidays.filter(h => h.date !== dateStr);
    } else {
      // Add it
      const newHoliday: Holiday = {
        date: dateStr,
        name: 'Día No Laborable', // Generic name for user selections
        type: 'corporate'
      };
      updatedHolidays = [...localSettings.customHolidays, newHoliday];
    }
    handleUpdate('customHolidays', updatedHolidays);
  };

  const finalizeSetup = () => {
    updateSettings({ ...localSettings, setupComplete: true });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Apply theme immediately for preview
  useEffect(() => {
    if (localSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [localSettings.theme]);

  // Render Helpers
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-sentry-active' :
              s < step ? 'w-2 bg-sentry-active/40' : 'w-2 bg-white/10'
            }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background transition-colors duration-300">
      <div className="w-full max-w-3xl bg-surface rounded-2xl border border-main p-6 sm:p-10 transition-all duration-300">

        <div className="text-center mb-8 text-main">
          <h1 className="text-2xl font-bold tracking-tight mb-2 uppercase">
            {step === 1 && "Configuración Regional"}
            {step === 2 && "Calendario de Precisión"}
            {step === 3 && "Protocolo Sentry"}
          </h1>
          <p className="text-muted text-sm">
            {step === 1 && "Define tu moneda y entorno base."}
            {step === 2 && "Pinta los días que NO trabajarás este año."}
            {step === 3 && "Sentry observará cada movimiento bajo este prisma."}
          </p>
        </div>

        {renderStepIndicator()}

        {/* Content Body */}
        <div className="min-h-[300px]">

          {/* STEP 1: LOCALIZATION */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6 max-w-md mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">País</label>
                  <div className="relative">
                    <select
                      disabled
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed appearance-none"
                    >
                      <option>🇺🇾 Uruguay</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Idioma</label>
                  <select
                    value={localSettings.language}
                    onChange={(e) => handleUpdate('language', e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  >
                    <option value="es-UY">Español (Latam)</option>
                    <option value="en-US">English (US)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Moneda Base</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['UYU', 'USD', 'UI', 'UR'] as Currency[]).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => handleUpdate('baseCurrency', curr)}
                      className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all duration-200 ${localSettings.baseCurrency === curr
                          ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <span className="font-bold text-lg">{curr}</span>
                      {localSettings.baseCurrency === curr && <Check className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CALENDAR */}
          {step === 2 && (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="w-full max-w-sm mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm text-center">
                Toca los días para marcarlos como <strong>Feriados de Empresa</strong>.
              </div>
              <Calendar
                selectedDates={localSettings.customHolidays}
                nationalHolidays={URUGUAY_HOLIDAYS_2024}
                onToggleDate={handleToggleHoliday}
              />
              <div className="mt-4 text-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {localSettings.customHolidays.length} días seleccionados
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: GUARDIAN */}
          {step === 3 && (
            <div className="animate-fade-in space-y-4 max-w-xl mx-auto">
              {[
                {
                  id: 'military',
                  title: 'Militar',
                  desc: 'Régimen estricto. Ideal para salir de crisis agresivamente. No tolera gastos hormiga y te exigirá disciplina total.',
                  icon: <Briefcase className="w-6 h-6" />
                },
                {
                  id: 'analytic',
                  title: 'Analítico',
                  desc: 'Foco en métricas y optimización matemática. Sin juicios emocionales, solo proyecciones frías y datos objetivos.',
                  icon: <Zap className="w-6 h-6" />
                },
                {
                  id: 'colleague',
                  title: 'Colega',
                  desc: 'Enfoque equilibrado y motivacional. Te ayuda a mejorar hábitos con refuerzo positivo y flexibilidad controlada.',
                  icon: <Bot className="w-6 h-6" />
                },
              ].map((mode) => {
                const isSelected = localSettings.guardianMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleUpdate('guardianMode', mode.id)}
                    className={`w-full p-5 rounded-xl border-2 text-left flex items-start gap-4 transition-all duration-200 group ${isSelected
                        ? 'border-primary-600 bg-primary-50 dark:bg-slate-800 dark:border-primary-500 shadow-lg shadow-primary-900/5'
                        : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <div className={`p-3 rounded-lg flex-shrink-0 transition-colors ${isSelected
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-400'
                        : 'bg-white dark:bg-slate-700 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}>
                      {mode.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-1 transition-colors ${isSelected
                          ? 'text-primary-800 dark:text-white' // DARK MODE: White Text for Title
                          : 'text-slate-700 dark:text-slate-200'
                        }`}>
                        {mode.title}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors ${isSelected
                          ? 'text-primary-700 dark:text-slate-300' // DARK MODE: Slate Text for Desc
                          : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        {mode.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 4: THEME */}
          {step === 4 && (
            <div className="animate-fade-in text-center max-w-lg mx-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <button
                  onClick={() => handleUpdate('theme', 'light')}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${localSettings.theme === 'light'
                      ? 'border-primary-600 bg-white shadow-xl scale-105'
                      : 'border-slate-200 bg-slate-50 opacity-60 hover:opacity-100'
                    }`}
                >
                  <div className="p-4 bg-orange-100 rounded-full text-orange-500">
                    <Sun className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-slate-800">Modo Claro</span>
                </button>

                <button
                  onClick={() => handleUpdate('theme', 'dark')}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${localSettings.theme === 'dark'
                      ? 'border-primary-600 bg-slate-800 shadow-xl scale-105'
                      : 'border-slate-700 bg-slate-800 opacity-60 hover:opacity-100'
                    }`}
                >
                  <div className="p-4 bg-indigo-900 rounded-full text-indigo-300">
                    <Moon className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-white">Modo Oscuro</span>
                </button>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Preview</h4>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  Así se verá tu Dashboard financiero. <br />
                  <span className="text-primary-600">Limpio, enfocado y profesional.</span>
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1}
            className={step === 1 ? 'invisible text-muted' : 'text-muted hover:text-main'}
          >
            Atrás
          </Button>

          {step < 3 ? (
            <Button onClick={nextStep} className="px-8 bg-surface border border-main text-main hover:bg-white/5">
              Continuar
            </Button>
          ) : (
            <Button onClick={finalizeSetup} className="px-8 bg-sentry-active hover:bg-red-700 text-white font-black">
              ACTIVAR WARDEN
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};