import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

import { MousePointerClick, Zap, Shield, Link2, Copy, Check, ArrowRight, Loader2 } from 'lucide-react';

import LandingCard from "@/shared/widgets/LandingCard/LandingCard";

import cards from "@/lib/cards";

import { useNavigate } from "react-router-dom";
import { isLoggedIn, apiShortenPublic } from "@/lib/api";

const App = () => {

  const navigate = useNavigate();
  const [inputUrl, setInputUrl] = useState('');
  const [result, setResult] = useState<{ slug: string; short_url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleLoginRegistration = () => {
    navigate('/login');
  };

  const handleShorten = async () => {
    const url = inputUrl.trim();
    if (!url) {
      setError('Введите ссылку');
      inputRef.current?.focus();
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await apiShortenPublic(url);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleShorten();
  };

  return (
    <>
    <header className="w-full bg-white flex flex-wrap items-center justify-between py-3 px-4 md:py-4 md:px-8">
      <div className="flex items-center gap-3">
        <div className="size-10 flex items-center justify-center">
          <Link2 className="w-8 h-8 sm:w-10 sm:h-10" color="#5c7a2a"/>
        </div>
        <h1 className="font-bold text-lg md:text-[42px] text-foreground">Linxie</h1>
      </div>

      <nav className="flex items-center gap-3 md:gap-7 mt-3 md:mt-0">
        <Button onClick={handleLoginRegistration} className="w-[120px]">Войти</Button>
      </nav>
    </header>
    <main>
      <section id="information" className="flex flex-col items-center px-4 md:px-0">
        <div className="w-full max-w-3xl mt-5 flex flex-col items-center">
          <span className="text-2xl text-foreground md:text-[46px] self-center text-center font-bold">Сокращайте ссылки, отслеживайте результаты, развивайте бизнес</span>
          <p className="text-base md:text-[20px] self-center text-center mt-4 md:mt-5 text-gray-500">Создавайте короткие ссылки, генерируйте QR-коды и отслеживайте каждый клик. Попробуйте прямо сейчас — бесплатно.</p>
        </div>

        <div className="w-full max-w-2xl mt-8 mb-10 px-0">
          {/* Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={inputRef}
              type="url"
              value={inputUrl}
              onChange={e => { setInputUrl(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Вставьте длинную ссылку..."
              className={`flex-1 border-3 rounded-[12px] px-4 py-3 text-base outline-none transition-colors
                ${error ? 'border-red-400' : 'border-border focus:border-primary'}`}
            />
            <Button
              onClick={handleShorten}
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-[12px] font-semibold text-base shrink-0 h-auto"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : 'Сократить'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>}

          {/* Result */}
          {result && (
            <div className="mt-4 bg-white border-3 border-primary rounded-[12px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-1 truncate">{inputUrl}</p>
                <a
                  href={result.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold text-lg hover:underline break-all"
                >
                  {result.short_url}
                </a>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 shrink-0 border-2 border-border rounded-[8px] px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
          )}

          {/* CTA after result */}
          {result && (
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500 bg-background border-3 border-border rounded-[12px] p-4">
              <span>Зарегистрируйтесь, чтобы управлять ссылками и видеть аналитику кликов</span>
              <button
                onClick={handleLoginRegistration}
                className="flex items-center gap-1 text-primary font-semibold hover:underline shrink-0"
              >
                Создать аккаунт <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="cards" className="bg-white py-10">
        <div className="self-center flex flex-col gap-2 items-center mb-8 px-4">
          <h2 className="text-2xl sm:text-3xl md:text-[42px] font-bold text-center">Всё, что нужно для успеха</h2>
          <p className="text-gray-600 text-sm sm:text-base text-center max-w-2xl">
            Мощные инструменты для современных маркетологов и бизнеса
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-[1400px] mx-auto place-items-stretch px-4">
          {cards.map((card, i) => (
            <div key={i} className="w-full flex justify-center">
              <LandingCard icon={card.icon} title={card.title} text={card.text} />
            </div>
          ))}
        </div>
      </section>

      <section id="last_part" className="bg-background">
        <div className="flex flex-col sm:flex-row items-center justify-evenly gap-4 py-6 sm:h-[120px] bg-[var(--color-navbar)] text-[var(--color-page-bg)] text-sm sm:text-lg font-medium px-4">
          <p>Бесплатный тариф навсегда</p>
          <p>Простой и понятный интерфейс</p>
          <p>Аналитика с первого клика</p>
        </div>

        <div className="flex flex-col md:flex-row px-4 sm:px-8 md:px-16 py-8 md:py-20 gap-8 md:gap-16">
          <article className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Всё под контролем — даже без маркетолога</h2>
            <p className="text-gray-600 mb-10 leading-relaxed text-[16px]">
              Разместите QR-код на визитке или меню, а Linxie покажет, сколько людей перешло, откуда и когда. Никаких настроек — зарегистрировались и сразу работаете.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-primary">
                  <MousePointerClick color="white"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Отслеживайте каждый клик</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-[16px]">
                    Узнайте, сколько людей переходят по вашим ссылкам и когда они это делают.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-primary">
                  <Zap color="white"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Молниеносная скорость</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-[16px]">
                    Создавайте короткие ссылки за секунды. Удобный интерфейс даёт вам всё необходимое быстро.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-primary">
                  <Shield color="white"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Безопасность и надёжность</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-[16px]">
                    Ваши ссылки и данные защищены средствами безопасности корпоративного уровня.
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="w-full md:w-1/2">
            <div className="bg-primary text-white rounded-2xl p-6 md:p-10 h-full flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Готовы начать?</h3>
              <p className="text-white/80 mb-8">
                Присоединяйтесь к тысячам компаний, которые используют Linxie для отслеживания маркетинговых кампаний и расширения охвата.
              </p>
              <button className="bg-white text-primary font-semibold py-3 px-6 rounded-lg flex
              items-center justify-center gap-2 hover:bg-white/90 transition w-full"
              onClick={handleLoginRegistration}>
                Создать бесплатный аккаунт →
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
    <footer className="bg-[var(--color-navbar)] text-[var(--color-page-bg)] px-4 sm:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-bold text-xl sm:text-2xl text-[var(--color-page-bg)]">Linxie</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm text-white/70">
          <button onClick={handleLoginRegistration} className="hover:text-white transition-colors">Войти</button>
          <span className="hidden sm:inline">·</span>
          <span>© {new Date().getFullYear()} Linxie. Все права защищены.</span>
        </div>
      </div>
    </footer>
    </>
  )
}

export default App;
