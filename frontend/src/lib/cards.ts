import { Link2 } from 'lucide-react';
import { ChartLine } from 'lucide-react';
import { QrCode } from 'lucide-react';
import { Globe } from 'lucide-react';
import { Smartphone } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

const cards = [
    {
      icon: Link2,
      title: 'Короткие ссылки за секунды',
      text: 'Вставьте любую длинную ссылку и получите компактный URL. Просто, быстро, без лишних шагов.'
    },

    {
      icon: ChartLine,
      title: 'Расширенная аналитика',
      text: 'Отслеживайте клики, географию, устройства, браузеры и многое другое. Принимайте решения на основе данных.'
    },

    {
      icon: QrCode,
      title: 'Генерация QR-кодов',
      text: 'Мгновенно генерируйте QR-коды для любой короткой ссылки. Идеально для печатных материалов, постеров и упаковки.'
    },

    {
      icon: Globe,
      title: 'Географическое отслеживание',
      text: 'Узнайте, откуда приходят клики, с помощью данных о географии на уровне стран.'
    },

    {
      icon: Smartphone,
      title: 'Аналитика устройств',
      text: 'Лучше понимайте аудиторию с помощью подробной статистики по устройствам, ОС и браузерам.'
    },

    {
      icon: TrendingUp,
      title: 'Анализ эффективности',
      text: 'Отслеживайте тренды кликов во времени и находите самые эффективные ссылки.'
    },
]

export default cards;
