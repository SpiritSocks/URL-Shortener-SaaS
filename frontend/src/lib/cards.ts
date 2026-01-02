import { Unlink2 } from 'lucide-react';
import { ChartLine } from 'lucide-react';
import { QrCode } from 'lucide-react';
import { Globe } from 'lucide-react';
import { Smartphone } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

const cards = [
    {
      icon: Unlink2, 
      title: 'Unlimited Short Links', 
      text: 'Create as many short links as you need. No limits, no restriction. Perfect for all your needs.'
    },
    
    {
      icon: ChartLine, 
      title: 'Advanced Analytics', 
      text: 'Track clicks, locations, devices, browsers, and more. Make data-driven decisions with real-time insights.'
    },

    {
      icon: QrCode, 
      title: 'QR Code Generation', 
      text: 'Generate QR codes instantly for any short link. Perfect for print materials, posters, and packaging.'
    },

    {
      icon: Globe, 
      title: 'Geographic Tracking', 
      text: 'See where your clicks come from with country-level geographic data and insights.'
    },

    {
      icon: Smartphone, 
      title: 'Device Analytics', 
      text: 'Understand your audience better with detailed device, operating system, and browser statistics.'
    },

    {
      icon: TrendingUp, 
      title: 'Performance Insights', 
      text: 'Monitor click trends over time and identify your top-performing links at a glance.'
    },
]

export default cards;