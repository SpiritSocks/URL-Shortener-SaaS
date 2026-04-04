import { Link2 } from 'lucide-react';
import { ChartLine } from 'lucide-react';
import { QrCode } from 'lucide-react';
import { Globe } from 'lucide-react';
import { LayoutList } from 'lucide-react';
import { MonitorSmartphone } from 'lucide-react';

const cards = [
    {
      icon: Link2,
      title: 'Короткие ссылки за секунды',
      text: 'Вставьте любую длинную ссылку и получите компактный URL. Просто, быстро, без лишних шагов.'
    },

    {
      icon: QrCode,
      title: 'Генерация QR-кодов',
      text: 'Мгновенно генерируйте QR-коды для любой короткой ссылки. Идеально для визиток, меню, постеров и упаковки.'
    },

    {
      icon: ChartLine,
      title: 'Аналитика кликов',
      text: 'Отслеживайте клики, географию, устройства и браузеры. Узнайте, какой канал приводит больше всего людей.'
    },

    {
      icon: LayoutList,
      title: 'Био-страница',
      text: 'Один link-in-bio для всех ваших ссылок. Разместите в Instagram, Telegram или на визитке — и ведите аудиторию куда нужно.'
    },

    {
      icon: Globe,
      title: 'Кастомные домены',
      text: 'Используйте собственный домен для коротких ссылок. Ссылки выглядят профессионально и усиливают узнаваемость бренда.'
    },

    {
      icon: MonitorSmartphone,
      title: 'Работает на любом устройстве',
      text: 'Создавайте ссылки и смотрите статистику с телефона, планшета или компьютера — интерфейс адаптирован под любой экран.'
    },
]

export default cards;
