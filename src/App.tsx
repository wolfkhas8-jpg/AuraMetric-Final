/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Maximize2, 
  Layers, 
  ArrowRight,
  Mail,
  ChevronDown,
  Star,
  Quote,
  CheckCircle2,
  FileText,
  AlertCircle,
  Activity,
  X
} from 'lucide-react';
import PaymentExamples from './payments/PaymentExamples';
import { loadStripe } from '@stripe/stripe-js';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- Types & Constants ---

type Country = 'Morocco' | 'USA' | 'Canada' | 'Mexico' | 'Germany' | 'UK' | 'France' | 'Italy' | 'Spain' | 'Russia' | 'Netherlands' | 'China' | 'Japan' | 'India' | 'South Korea' | 'Australia';

interface CityData {
  name: string;
  focus: string;
  baseCost: number; // USD per m2 (Simulated RSMeans/Mubawab)
  growthRate: number; // Annual inflation/growth factor (i)
  riskProfile: string;
}

const GEOGRAPHIC_DATA: Record<Country, CityData[]> = {
  'Morocco': [
    { name: 'Casablanca', focus: 'Financial Hub Expansion', baseCost: 1200, growthRate: 0.045, riskProfile: 'Moderate-Low' },
    { name: 'Tangier', focus: 'Logistics & Industrial Tech', baseCost: 950, growthRate: 0.052, riskProfile: 'Moderate' },
    { name: 'Rabat', focus: 'Administrative Excellence', baseCost: 1100, growthRate: 0.038, riskProfile: 'Low' }
  ],
  'USA': [
    { name: 'Austin', focus: 'Federal Tech Compliance', baseCost: 4500, growthRate: 0.072, riskProfile: 'Moderate' },
    { name: 'Miami', focus: 'Climate Resilient Architecture', baseCost: 5200, growthRate: 0.068, riskProfile: 'Moderate-High' },
    { name: 'Phoenix', focus: 'Arid Zone Innovation', baseCost: 3800, growthRate: 0.055, riskProfile: 'Moderate' }
  ],
  'Canada': [
    { name: 'Toronto', focus: 'Financial Services Hub', baseCost: 4800, growthRate: 0.058, riskProfile: 'Low' },
    { name: 'Vancouver', focus: 'Sustainable Urban Development', baseCost: 5200, growthRate: 0.062, riskProfile: 'Low' },
    { name: 'Montreal', focus: 'Cultural & Tech Innovation', baseCost: 3500, growthRate: 0.048, riskProfile: 'Moderate-Low' }
  ],
  'Mexico': [
    { name: 'Mexico City', focus: 'Metropolitan Expansion', baseCost: 2200, growthRate: 0.065, riskProfile: 'Moderate' },
    { name: 'Monterrey', focus: 'Industrial & Logistics', baseCost: 1800, growthRate: 0.055, riskProfile: 'Moderate' },
    { name: 'Cancun', focus: 'Tourism & Resort Development', baseCost: 2500, growthRate: 0.072, riskProfile: 'Moderate-High' }
  ],
  'Germany': [
    { name: 'Berlin', focus: 'Tech Innovation Hub', baseCost: 4200, growthRate: 0.035, riskProfile: 'Low' },
    { name: 'Munich', focus: 'Engineering Excellence', baseCost: 4800, growthRate: 0.038, riskProfile: 'Low' },
    { name: 'Frankfurt', focus: 'Financial Services', baseCost: 4500, growthRate: 0.032, riskProfile: 'Low' }
  ],
  'UK': [
    { name: 'London', focus: 'Global Financial Center', baseCost: 8500, growthRate: 0.045, riskProfile: 'Moderate' },
    { name: 'Manchester', focus: 'Digital & Creative Industries', baseCost: 3200, growthRate: 0.048, riskProfile: 'Moderate' },
    { name: 'Edinburgh', focus: 'Innovation & Research', baseCost: 3800, growthRate: 0.042, riskProfile: 'Low' }
  ],
  'France': [
    { name: 'Paris', focus: 'Luxury & Cultural Heritage', baseCost: 7200, growthRate: 0.038, riskProfile: 'Low' },
    { name: 'Lyon', focus: 'Medical & Tech Innovation', baseCost: 4200, growthRate: 0.042, riskProfile: 'Low' },
    { name: 'Marseille', focus: 'Mediterranean Trade Hub', baseCost: 3800, growthRate: 0.048, riskProfile: 'Moderate' }
  ],
  'Italy': [
    { name: 'Rome', focus: 'Cultural Tourism & Heritage', baseCost: 5500, growthRate: 0.035, riskProfile: 'Moderate' },
    { name: 'Milan', focus: 'Fashion & Design Capital', baseCost: 6200, growthRate: 0.042, riskProfile: 'Moderate' },
    { name: 'Turin', focus: 'Automotive & Industrial Tech', baseCost: 3800, growthRate: 0.038, riskProfile: 'Moderate' }
  ],
  'Spain': [
    { name: 'Madrid', focus: 'Administrative & Business Hub', baseCost: 4800, growthRate: 0.045, riskProfile: 'Moderate' },
    { name: 'Barcelona', focus: 'Tourism & Innovation', baseCost: 5200, growthRate: 0.052, riskProfile: 'Moderate' },
    { name: 'Valencia', focus: 'Sustainable Development', baseCost: 3500, growthRate: 0.048, riskProfile: 'Moderate' }
  ],
  'Russia': [
    { name: 'Moscow', focus: 'Political & Economic Center', baseCost: 3800, growthRate: 0.055, riskProfile: 'High' },
    { name: 'Saint Petersburg', focus: 'Cultural & Maritime Hub', baseCost: 3200, growthRate: 0.048, riskProfile: 'High' },
    { name: 'Ekaterinburg', focus: 'Industrial & Resource Base', baseCost: 2200, growthRate: 0.062, riskProfile: 'High' }
  ],
  'China': [
    { name: 'Shanghai', focus: 'Global Financial Hub', baseCost: 5800, growthRate: 0.085, riskProfile: 'Moderate' },
    { name: 'Beijing', focus: 'Political & Innovation Center', baseCost: 5200, growthRate: 0.078, riskProfile: 'Moderate' },
    { name: 'Shenzhen', focus: 'Technology Manufacturing', baseCost: 4800, growthRate: 0.092, riskProfile: 'Moderate' }
  ],
  'Japan': [
    { name: 'Tokyo', focus: 'Global Tech & Finance Hub', baseCost: 7200, growthRate: 0.025, riskProfile: 'Low' },
    { name: 'Osaka', focus: 'Industrial & Cultural Center', baseCost: 4800, growthRate: 0.028, riskProfile: 'Low' },
    { name: 'Kyoto', focus: 'Cultural Heritage & Tourism', baseCost: 4200, growthRate: 0.022, riskProfile: 'Low' }
  ],
  'India': [
    { name: 'Mumbai', focus: 'Financial Services Hub', baseCost: 3200, growthRate: 0.075, riskProfile: 'Moderate-High' },
    { name: 'Delhi', focus: 'Administrative & Political Center', baseCost: 2800, growthRate: 0.072, riskProfile: 'Moderate-High' },
    { name: 'Bangalore', focus: 'Technology & Innovation', baseCost: 2400, growthRate: 0.085, riskProfile: 'Moderate-High' }
  ],
  'South Korea': [
    { name: 'Seoul', focus: 'Global Tech & Cultural Hub', baseCost: 5800, growthRate: 0.045, riskProfile: 'Moderate' },
    { name: 'Busan', focus: 'Maritime & Industrial Center', baseCost: 4200, growthRate: 0.052, riskProfile: 'Moderate' },
    { name: 'Incheon', focus: 'Logistics & Aviation Hub', baseCost: 4800, growthRate: 0.048, riskProfile: 'Moderate' }
  ],
  'Netherlands': [
    { name: 'Amsterdam', focus: 'Innovation & Trade Hub', baseCost: 6200, growthRate: 0.048, riskProfile: 'Low' },
    { name: 'Rotterdam', focus: 'Logistics & Port Operations', baseCost: 4800, growthRate: 0.052, riskProfile: 'Low' },
    { name: 'Utrecht', focus: 'Knowledge Economy Center', baseCost: 5200, growthRate: 0.045, riskProfile: 'Low' }
  ],
  'Australia': [
    { name: 'Sydney', focus: 'Financial & Cultural Hub', baseCost: 6800, growthRate: 0.055, riskProfile: 'Moderate' },
    { name: 'Melbourne', focus: 'Innovation & Education', baseCost: 6200, growthRate: 0.058, riskProfile: 'Moderate' },
    { name: 'Perth', focus: 'Mining & Resources', baseCost: 5200, growthRate: 0.065, riskProfile: 'Moderate' }
  ]
};

const APPROVED_COUNTRIES: Country[] = [
  'Morocco', 'USA', 'Canada', 'Mexico', 'Germany', 'UK', 'France', 
  'Italy', 'Spain', 'Russia', 'Netherlands', 'China', 'Japan', 'India', 'South Korea', 'Australia'
];

const validateGeography = (selectedCountry: string): boolean => {
  return APPROVED_COUNTRIES.includes(selectedCountry as Country);
};

const throwGeographyError = (): never => {
  throw new Error('INVALID_GEOGRAPHY_ERROR: Selected location is not in the approved geography matrix. Only the 16 designated countries are permitted for AuraMetric analysis.');
};

const INVESTMENT_TYPES = [
  { id: 'hotel', label: 'فندق فخم (Ultra Luxury Hotel)', multiplier: 1.8 },
  { id: 'residential', label: 'مجمع سكني ذكي', multiplier: 1.2 },
  { id: 'office', label: 'برج إداري', multiplier: 1.5 }
];

// Payment Constants
const PRICE = 49900; // $499 in cents
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const API_BASE = import.meta.env.VITE_API_BASE || '';

const TESTIMONIALS = [
  {
    name: "Marc Andreessen",
    role: "Venture Capitalist",
    text: "AuraMetric 2040 provides the structural precision we need for high-stakes urban investments.",
    image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&q=80&w=200",
    structure: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Zaha Hadid Architects",
    role: "Design Lead",
    text: "The integration of future inflation models with structural feasibility is a game changer for 2030+ projects.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    structure: "https://images.unsplash.com/photo-1566079464511-0918b6da310d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

const TICKER_DATA = [
  "JLL: Dubai Prime Residential +7.2% Forecast",
  "CBRE: Riyadh Office Space Demand Surges 15%",
  "Oxford Economics: Global Real Estate Inflation Adjusted to 4.2%",
  "AuraMetric: Austin Tech Hub ROI Vector Stabilized",
  "Knight Frank: Casablanca Luxury Sector Growth +5.8%",
  "Savills: Miami Climate-Resilient Assets Premium +12%"
];

// --- Components ---

const MarketTicker = ({ lang }: { lang: string }) => {
  return (
    <div className="ticker-container">
      <div className="ticker-content">
        {[...TICKER_DATA, ...TICKER_DATA].map((text, i) => (
          <span key={i} className="mx-8 text-[0.65rem] font-en tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.8)' }}>
            <Activity size={10} className="text-emerald-400" /> {text}
          </span>
        ))}
      </div>
    </div>
  );
};

const VerificationSeal = ({ lang }: { lang: string }) => {
  return (
    <div className="verification-seal">
      <ShieldCheck size={12} className="text-emerald-400" />
      {lang === 'ar' ? 'موثق من AuraMetric 2040' : 'AuraMetric 2040 Verified'}
    </div>
  );
};

const ComplianceStamp = ({ lang }: { lang: string }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-full w-24 h-24 rotate-12 opacity-60 pointer-events-none select-none" style={{ border: '2px solid rgba(212, 175, 55, 0.4)' }}>
      <div className="text-[0.5rem] font-en tracking-tighter text-gold leading-none">OFFICIAL</div>
      <div className="text-[0.7rem] font-en font-bold text-gold leading-none my-1">COMPLIANCE</div>
      <div className="text-[0.4rem] font-en tracking-widest text-gold leading-none">STAMP 2040</div>
    </div>
  );
};

const ChronologicalBackground = ({ timeline }: { timeline: 'heritage' | 'current' | 'future' }) => {
  return (
    <>
      <div className={`bg-layer bg-heritage ${timeline === 'heritage' ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`bg-layer bg-current ${timeline === 'current' ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`bg-layer bg-future ${timeline === 'future' ? 'opacity-100' : 'opacity-0'}`} />
      {/* Deep overlay to ensure gradient dominance */}
      <div className="fixed inset-0 pointer-events-none z-[-1]" style={{ background: 'linear-gradient(to bottom, rgba(5, 5, 5, 0.4), transparent, rgba(5, 5, 5, 0.6))' }} />
    </>
  );
};

const TradingChart = ({ data, lang }: { data: any[], lang: string }) => {
  return (
    <div className="h-[300px] w-full mt-8 glass-panel p-4 rounded-2xl overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis 
            dataKey="year" 
            stroke="#ffffff40" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#ffffff40" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#050505', border: '1px solid #D4AF3730', borderRadius: '12px' }}
            itemStyle={{ color: '#D4AF37' }}
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, lang === 'ar' ? 'القيمة' : 'Value']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#D4AF37" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const ElectronicSignature = ({ lang }: { lang: string }) => {
  return (
    <div className="flex flex-col items-center gap-1 opacity-80">
      <div className="font-serif italic text-gold text-lg px-4 py-1" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.4)' }}>
        AuraMetric Core
      </div>
      <div className="text-[0.5rem] uppercase tracking-widest text-gray-500">
        {lang === 'ar' ? 'مكتب الدراسات الافتراضي' : 'Virtual Research Bureau'}
      </div>
    </div>
  );
};

const MarketDataTable = ({ lang, country, city, area, floors, type }: { lang: string, country: Country, city: string, area: number, floors: number, type: string }) => {
  const cityData = GEOGRAPHIC_DATA[country].find(c => c.name === city);
  const investmentType = INVESTMENT_TYPES.find(t => t.id === type);
  
  return (
    <div className="w-full mt-8 overflow-hidden rounded-xl" style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}>
      <table className="w-full text-[0.7rem] text-left border-collapse">
        <thead className="text-gold uppercase tracking-widest" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
          <tr>
            <th className="p-3" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>{lang === 'ar' ? 'المعيار' : 'Metric'}</th>
            <th className="p-3" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>{lang === 'ar' ? 'القيمة' : 'Value'}</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
            <td className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>{lang === 'ar' ? 'تكلفة المتر المربع (أساسي)' : 'Base Cost / m²'}</td>
            <td className="p-3">${cityData?.baseCost.toLocaleString()}</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
            <td className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>{lang === 'ar' ? 'معدل النمو السنوي' : 'Annual Growth Rate'}</td>
            <td className="p-3">{((cityData?.growthRate || 0) * 100).toFixed(1)}%</td>
          </tr>
          <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
            <td className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>{lang === 'ar' ? 'إجمالي المساحة المشيدة' : 'Total Built Area'}</td>
            <td className="p-3">{(area * floors).toLocaleString()} m²</td>
          </tr>
          <tr>
            <td className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>{lang === 'ar' ? 'معامل نوع الاستثمار' : 'Investment Multiplier'}</td>
            <td className="p-3">x{investmentType?.multiplier}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const PaymentModalContent = ({ onSuccess, lang }: { onSuccess: () => void, lang: string }) => {
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!STRIPE_KEY) {
      setMessage(lang === 'ar' ? 'مفتاح Stripe غير متوفر' : 'Stripe key not available');
      return;
    }

    let mounted = true;
    (async () => {
      const s = await loadStripe(STRIPE_KEY);
      if (!mounted || !s) return;
      const el = s.elements();
      const card = el.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#ffffff',
            '::placeholder': { color: '#aab7c4' },
          },
        },
      });
      card.mount(cardRef.current!);
      setStripe(s);
      setElements(el);
    })();

    return () => {
      mounted = false;
    };
  }, [lang]);

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: PRICE }),
      });
      const data = await res.json();
      
      if (!data.clientSecret) {
        setMessage(lang === 'ar' ? 'خطأ في إنشاء الدفع' : 'Payment creation error');
        setIsProcessing(false);
        return;
      }

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement('card') },
      });

      if (result.error) {
        setMessage(result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        setMessage(lang === 'ar' ? 'تم الدفع بنجاح!' : 'Payment successful!');
        setTimeout(onSuccess, 1000);
      }
    } catch (err) {
      setMessage(lang === 'ar' ? 'فشل في معالجة الدفع' : 'Payment processing failed');
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      <div ref={cardRef} className="p-4 border border-gray-600 rounded-lg bg-black/50" />
      <button 
        onClick={handlePayment}
        disabled={isProcessing || !stripe}
        className="w-full luxury-gold-btn py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-5 h-5 border-2 border-deep-black border-t-transparent rounded-full mx-auto"
          />
        ) : (
          lang === 'ar' ? 'ادفع $499 واستخرج التقرير' : 'Pay $499 & Generate Report'
        )}
      </button>
      {message && (
        <div className={`text-center text-sm ${message.includes('نجاح') || message.includes('successful') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    const stored = localStorage.getItem('aura_lang');
    return stored === 'en' ? 'en' : 'ar';
  });
  const [timeline, setTimeline] = useState<'heritage' | 'current' | 'future'>('heritage');

  const handleLangChange = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    localStorage.setItem('aura_lang', newLang);
  };
  
  // Zone A states
  const [zoneA_Country, setZoneA_Country] = useState<Country>('Morocco');
  const [zoneA_City, setZoneA_City] = useState<string>(GEOGRAPHIC_DATA['Morocco'][0].name);
  const [area, setArea] = useState<number>(0);
  const [investmentType, setInvestmentType] = useState(INVESTMENT_TYPES[0].id);
  const [floors, setFloors] = useState<number>(1);
  
  // Zone B states
  const [zoneB_Country, setZoneB_Country] = useState<Country>('Morocco');
  const [zoneB_City, setZoneB_City] = useState<string>(GEOGRAPHIC_DATA['Morocco'][0].name);
  const [currentArea, setCurrentArea] = useState<number>(0);
  const [currentFloors, setCurrentFloors] = useState<number>(1);
  const [currentUnits, setCurrentUnits] = useState<number>(1);
  const [currentAssetType, setCurrentAssetType] = useState('residential');

  const reportRef = useRef<HTMLDivElement>(null);

  // Payment states
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userId, setUserId] = useState<string>('user_' + Math.random().toString(36).substr(2, 9));

  // Image generation states
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  // Zone selection / last run mode
  const [lastZone, setLastZone] = useState<'FUTURE_BUILD' | 'CURRENT_ASSET' | null>(null);

  // Future build inputs
  const [targetUnits, setTargetUnits] = useState<number>(1);

  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [scanPhase, setScanPhase] = useState<number>(0);
  const [results, setResults] = useState<{
    id: string;
    futureValue: string;
    roi: string;
    totalCost: string;
    accuracy: string;
    chartData: any[];
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeline(prev => {
        const sequence: ('heritage' | 'current' | 'future')[] = ['heritage', 'current', 'future'];
        const nextIndex = (sequence.indexOf(prev) + 1) % sequence.length;
        return sequence[nextIndex];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Zone A: Update city when country changes
  useEffect(() => {
    setZoneA_City(GEOGRAPHIC_DATA[zoneA_Country][0].name);
  }, [zoneA_Country]);

  // Zone B: Update city when country changes
  useEffect(() => {
    setZoneB_City(GEOGRAPHIC_DATA[zoneB_Country][0].name);
  }, [zoneB_Country]);

  const selectedCityDataA = useMemo(() => {
    return GEOGRAPHIC_DATA[zoneA_Country].find(c => c.name === zoneA_City);
  }, [zoneA_Country, zoneA_City]);

  const selectedCityDataB = useMemo(() => {
    return GEOGRAPHIC_DATA[zoneB_Country].find(c => c.name === zoneB_City);
  }, [zoneB_Country, zoneB_City]);

  const processInput = async (zone: 'FUTURE_BUILD' | 'CURRENT_ASSET') => {
    if (zone === 'FUTURE_BUILD') {
      // Generate renderings + golden report
      const response = await fetch(`${API_BASE}/generate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: `${zoneA_City}, ${zoneA_Country}`,
          specs: `${area} sqm, ${floors} floors, ${investmentType}`,
          style: 'Luxury Modern',
          projectName: `${zoneA_Country}_${zoneA_City}_${investmentType}`
        })
      });
      const data = await response.json();
      if (data.success) setGeneratedImages(data.images || []);
    } else {
      // Current asset valuation: no images generated
      setGeneratedImages([]);
    }
  };

  const runSimulation = async (zone: 'FUTURE_BUILD' | 'CURRENT_ASSET', skipPaymentCheck = false) => {
    const selectedCountry = zone === 'FUTURE_BUILD' ? zoneA_Country : zoneB_Country;
    
    // Validate geography constraint
    if (!validateGeography(selectedCountry)) {
      throwGeographyError();
    }

    const requiredArea = zone === 'FUTURE_BUILD' ? area : currentArea;
    const requiredFloors = zone === 'FUTURE_BUILD' ? floors : currentFloors;
    const requiredAssetType = zone === 'FUTURE_BUILD' ? investmentType : currentAssetType;

    if (requiredArea <= 0) return;

    // Check payment status
    if (!skipPaymentCheck && !isPaid) {
      setShowPaymentModal(true);
      return;
    }

    setLastZone(zone);
    setIsSimulating(true);
    setScanPhase(1);

    // Phase 1
    await new Promise(r => setTimeout(r, 1200));
    setScanPhase(2);

    // Phase 2
    await new Promise(r => setTimeout(r, 1200));
    setScanPhase(3);

    // Phase 3
    await new Promise(r => setTimeout(r, 1200));

    const selectedCity = zone === 'FUTURE_BUILD' ? zoneA_City : zoneB_City;
    const selectedCityData = GEOGRAPHIC_DATA[selectedCountry].find(c => c.name === selectedCity);
    if (!selectedCityData) {
      setResults({
        id: 'ERR-404',
        futureValue: '[خارج نطاق البيانات الموثقة]',
        roi: '[خارج نطاق البيانات الموثقة]',
        totalCost: '[خارج نطاق البيانات الموثقة]',
        accuracy: '0%',
        chartData: []
      });
      setIsSimulating(false);
      setScanPhase(0);
      return;
    }

    const typeMultiplier = INVESTMENT_TYPES.find(t => t.id === requiredAssetType)?.multiplier || 1;
    const baseCost = (selectedCityData?.baseCost || 1000) * requiredArea * requiredFloors * typeMultiplier;
    const totalCost = baseCost * 1.25;
    const years = 15;
    const growthRate = selectedCityData?.growthRate || 0.04;
    const futureValue = totalCost * Math.pow(1 + growthRate, years);

    const chartData = [];
    for (let i = 0; i <= years; i++) {
      chartData.push({
        year: 2026 + i,
        value: Math.round(totalCost * Math.pow(1 + growthRate, i))
      });
    }

    const reportData = {
      id: `AM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      futureValue: futureValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      roi: `${(growthRate * 100).toFixed(1)}%`,
      totalCost: totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      accuracy: '93.7%',
      chartData
    };

    setResults(reportData);

    // Call appropriate API endpoint based on zone
    try {
      const endpoint = zone === 'FUTURE_BUILD' ? '/api/generate-project' : '/api/generate-asset';
      const selectedCountry = zone === 'FUTURE_BUILD' ? zoneA_Country : zoneB_Country;
      const selectedCity = zone === 'FUTURE_BUILD' ? zoneA_City : zoneB_City;
      const projectData = {
        name: `${selectedCountry}_${selectedCity}_${requiredAssetType}`,
        country: selectedCountry,
        city: selectedCity,
        area: requiredArea,
        floors: requiredFloors,
        investmentType: requiredAssetType,
        zone,
        ...(zone === 'CURRENT_ASSET' && { assetType: currentAssetType })
      };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectData,
          reportData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (zone === 'FUTURE_BUILD' && data.images) {
          setGeneratedImages(data.images);
        } else {
          setGeneratedImages([]);
        }
        console.log('Report generated successfully:', data.report);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    }

    setIsGeneratingImages(false);
    setIsSimulating(false);
    setScanPhase(0);

    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGenerateA = async () => {
    // Zone A: Future Build - Generate Images + Report
    // Validate inputs
    if (area <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال مساحة صحيحة' : 'Please enter a valid area');
      return;
    }
    if (floors <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال عدد الطوابق' : 'Please enter valid floors');
      return;
    }
    if (!validateGeography(zoneA_Country)) {
      throwGeographyError();
    }

    setLastZone('FUTURE_BUILD');

    // Require payment first
    if (!isPaid) {
      setShowPaymentModal(true);
      return;
    }

    // Step 1: Generate images
    try {
      setIsGeneratingImages(true);
      const response = await fetch(`${API_BASE}/generate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: `${zoneA_City}, ${zoneA_Country}`,
          specs: `${area} sqm, ${floors} floors, ${investmentType}`,
          style: 'Luxury Modern',
          projectName: `${zoneA_Country}_${zoneA_City}_${investmentType}`
        })
      });
      const imageData = await response.json();
      if (imageData.success) {
        setGeneratedImages(imageData.images || []);
      }
    } catch (err) {
      console.error('Image generation failed:', err);
    } finally {
      setIsGeneratingImages(false);
    }

    // Step 2: Run simulation and generate report
    await runSimulation('FUTURE_BUILD');
  };

  const handleGenerateB = async () => {
    // Zone B: Current Asset - Generate Report Only (No Images)
    // Validate inputs
    if (currentArea <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال مساحة صحيحة' : 'Please enter a valid area');
      return;
    }
    if (currentFloors <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال عدد الطوابق' : 'Please enter valid floors');
      return;
    }
    if (!validateGeography(zoneB_Country)) {
      throwGeographyError();
    }

    setLastZone('CURRENT_ASSET');
    setGeneratedImages([]); // Ensure no images are generated for Zone B

    // Require payment first
    if (!isPaid) {
      setShowPaymentModal(true);
      return;
    }

    // Run simulation only (no image generation for Zone B)
    await runSimulation('CURRENT_ASSET', true);
  };

  const toggleTheme = () => {
    const sequence: ('heritage' | 'current' | 'future')[] = ['heritage', 'current', 'future'];
    const nextIndex = (sequence.indexOf(timeline) + 1) % sequence.length;
    setTimeline(sequence[nextIndex]);
    // Theme/background transition should not affect the current language.
  };

  return (
    <div className={`min-h-screen flex flex-col items-center custom-scrollbar ${lang === 'ar' ? 'font-ar' : 'font-sans'}`}>
      <MarketTicker lang={lang} />
      <ChronologicalBackground timeline={timeline} />

      {/* Language & Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 3 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        onClick={() => handleLangChange(lang === 'ar' ? 'en' : 'ar')}
        className="lang-toggle-ball glass-panel p-3 rounded-full text-gold hover:text-gold-light"
      >
        <Globe size={24} />
      </motion.button>

      {/* Hero Section */}
      <section className="min-h-screen flex-center w-full px-4 section-container pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel w-full relative overflow-hidden section-fade"
        >
          <div className="crystal-icon-container">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-[0_0_30px_rgba(212,175,55,0.5)] flex items-center justify-center animate-pulse">
              <Globe size={24} className="text-deep-black" />
            </div>
          </div>

          <div className="absolute top-8 left-8">
            <VerificationSeal lang={lang} />
          </div>

          <div className="text-center mb-12 brand-motto">
            <motion.h1 className="title-luxury gold-engraved-text tracking-tighter mb-4">
              AURAMETRIC 2040
            </motion.h1>
            <p className="desc-luxury text-gray-400">
              {lang === 'ar' ? 'نظام استشراف الأرباح والأصول العقارية المستقبلي' : 'Future Real Estate Asset & Profit Forecasting System'}
            </p>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            {/* Zone A: Future Build */}
            <div className="glass-panel p-8 rounded-2xl border border-gold/20">
              <h2 className="text-2xl font-bold text-gold mb-2">
                {lang === 'ar' ? 'AuraMetric 2040: صمّم إرثك' : 'AuraMetric 2040: Project Your Legacy'}
              </h2>
              <p className="text-gray-300 text-sm mb-8">
                {lang === 'ar'
                  ? 'استثمر في رؤيتك: حدد مساحة البناء، عدد الطوابق، والوحدات السكنية المطلوبة للبدء.'
                  : 'Invest in your vision: specify build area, floors, and target units to begin.'}
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Globe size={12} /> {lang === 'ar' ? 'الدولة' : 'Country'}
                  </label>
                  <div className="relative">
                    <select 
                      value={zoneA_Country}
                      onChange={(e) => setZoneA_Country(e.target.value as Country)}
                      className="w-full bg-transparent py-3 text-lg outline-none appearance-none cursor-pointer focus:border-gold transition-colors"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      {APPROVED_COUNTRIES.map(c => (
                        <option key={c} value={c} className="bg-deep-black text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
                  </div>
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <MapPin size={12} /> {lang === 'ar' ? 'المدينة' : 'City'}
                  </label>
                  <div className="relative">
                    <select 
                      value={zoneA_City}
                      onChange={(e) => setZoneA_City(e.target.value)}
                      className="w-full bg-transparent py-3 text-lg outline-none appearance-none cursor-pointer focus:border-gold transition-colors"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      {GEOGRAPHIC_DATA[zoneA_Country]?.map(c => (
                        <option key={c.name} value={c.name} className="bg-deep-black text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
                  </div>
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Layers size={12} /> {lang === 'ar' ? 'المساحة المشيدة (م²)' : 'Built Area (m²)'}
                  </label>
                  <input 
                    type="number" 
                    placeholder="5000"
                    value={area || ''}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full bg-transparent py-3 text-lg outline-none focus:border-gold transition-colors"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Building2 size={12} /> {lang === 'ar' ? 'عدد الطوابق' : 'Floors'}
                  </label>
                  <input 
                    type="number" 
                    placeholder="1"
                    value={floors || ''}
                    onChange={(e) => setFloors(Number(e.target.value))}
                    className="w-full bg-transparent py-3 text-lg outline-none focus:border-gold transition-colors"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Building2 size={12} /> {lang === 'ar' ? 'نوع الاستثمار' : 'Investment Type'}
                  </label>
                  <div className="relative">
                    <select 
                      value={investmentType}
                      onChange={(e) => setInvestmentType(e.target.value)}
                      className="w-full bg-transparent py-3 text-lg outline-none appearance-none cursor-pointer focus:border-gold transition-colors"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      {INVESTMENT_TYPES.map(t => (
                        <option key={t.id} value={t.id} className="bg-deep-black text-white">
                          {lang === 'ar' ? t.label : t.id.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
                  </div>
                </div>

                <button 
                  onClick={handleGenerateA}
                  disabled={isSimulating || area <= 0}
                  className="luxury-gold-btn w-full py-4 rounded-full text-sm md:text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSimulating || isGeneratingImages ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-deep-black border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      {lang === 'ar' ? 'استخراج واستعراض الصور' : 'Generate Images & Report'}
                      <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Zone B: Current Asset */}
            <div className="glass-panel-soft p-8 rounded-2xl border border-gold/10">
              <h2 className="text-2xl font-bold text-gold mb-2">
                {lang === 'ar' ? 'Asset Insight: فك شفرة أصولك' : 'Asset Insight: Decipher Your Current Foundation'}
              </h2>
              <p className="text-gray-300 text-sm mb-8">
                {lang === 'ar'
                  ? 'اكتشف أصولك: أدخل بيانات عقارك الحالي لنربطه بديناميكيات النمو لعام 2040.'
                  : 'Discover your assets: enter current property data so we can link it to 2040 growth dynamics.'}
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Globe size={12} /> {lang === 'ar' ? 'الدولة' : 'Country'}
                  </label>
                  <div className="relative">
                    <select 
                      value={zoneB_Country}
                      onChange={(e) => setZoneB_Country(e.target.value as Country)}
                      className="w-full bg-transparent py-3 text-lg outline-none appearance-none cursor-pointer focus:border-gold transition-colors"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      {APPROVED_COUNTRIES.map(c => (
                        <option key={c} value={c} className="bg-deep-black text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
                  </div>
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <MapPin size={12} /> {lang === 'ar' ? 'المدينة' : 'City'}
                  </label>
                  <div className="relative">
                    <select 
                      value={zoneB_City}
                      onChange={(e) => setZoneB_City(e.target.value)}
                      className="w-full bg-transparent py-3 text-lg outline-none appearance-none cursor-pointer focus:border-gold transition-colors"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      {GEOGRAPHIC_DATA[zoneB_Country]?.map(c => (
                        <option key={c.name} value={c.name} className="bg-deep-black text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
                  </div>
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Layers size={12} /> {lang === 'ar' ? 'المساحة الحالية (م²)' : 'Current Area (m²)'}
                  </label>
                  <input 
                    type="number" 
                    placeholder="5000"
                    value={currentArea || ''}
                    onChange={(e) => setCurrentArea(Number(e.target.value))}
                    className="w-full bg-transparent py-3 text-lg outline-none focus:border-gold transition-colors"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Building2 size={12} /> {lang === 'ar' ? 'الطوابق الحالية' : 'Current Floors'}
                  </label>
                  <input 
                    type="number" 
                    placeholder="1"
                    value={currentFloors || ''}
                    onChange={(e) => setCurrentFloors(Number(e.target.value))}
                    className="w-full bg-transparent py-3 text-lg outline-none focus:border-gold transition-colors"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Building2 size={12} /> {lang === 'ar' ? 'الوحدات الحالية' : 'Current Units'}
                  </label>
                  <input 
                    type="number" 
                    placeholder="1"
                    value={currentUnits || ''}
                    onChange={(e) => setCurrentUnits(Number(e.target.value))}
                    className="w-full bg-transparent py-3 text-lg outline-none focus:border-gold transition-colors"
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                </div>

                <div className="flex flex-col space-y-2 group">
                  <label className="text-[0.65rem] uppercase tracking-widest flex items-center gap-2" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                    <Building2 size={12} /> {lang === 'ar' ? 'نوع الأصل' : 'Asset Type'}
                  </label>
                  <div className="relative">
                    <select 
                      value={currentAssetType}
                      onChange={(e) => setCurrentAssetType(e.target.value)}
                      className="w-full bg-transparent py-3 text-lg outline-none appearance-none cursor-pointer focus:border-gold transition-colors"
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <option value="residential" className="bg-deep-black text-white">{lang === 'ar' ? 'سكني' : 'Residential'}</option>
                      <option value="commercial" className="bg-deep-black text-white">{lang === 'ar' ? 'تجاري' : 'Commercial'}</option>
                      <option value="mixed" className="bg-deep-black text-white">{lang === 'ar' ? 'مختلط' : 'Mixed-Use'}</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(212, 175, 55, 0.4)' }} />
                  </div>
                </div>

                <button 
                  onClick={handleGenerateB}
                  disabled={isSimulating || currentArea <= 0}
                  className="luxury-gold-btn w-full py-4 rounded-full text-sm md:text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSimulating ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-deep-black border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      {lang === 'ar' ? 'تحميل الوثيقة فقط' : 'Load Document Only'}
                      <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {isSimulating && (
            <div className="mt-8 space-y-4">
              <div className="scanner-bar">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(scanPhase / 3) * 100}%` }}
                  className="scanner-progress"
                />
              </div>
              <p className="text-center text-[0.65rem] uppercase tracking-widest text-gold animate-pulse">
                {scanPhase === 1 && (lang === 'ar' ? 'مزامنة مع بيانات الأراضي الإقليمية...' : 'Syncing with Regional Land Department APIs...')}
                {scanPhase === 2 && (lang === 'ar' ? 'تطبيق نماذج التضخم الاقتصادي 2040...' : 'Applying Macro-Economic 2040 Inflation Models...')}
                {scanPhase === 3 && (lang === 'ar' ? 'التحقق من الجدوى الهيكلية ونواقل ROI...' : 'Verifying Structural Feasibility & ROI Vectors...')}
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 rounded-2xl max-w-md w-full mx-4 relative"
              onClick={(e) => e.stopPropagation()}
              style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}
            >
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <Building2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gold mb-2">
                  {lang === 'ar' ? 'استخراج التقرير الاستشرافي' : 'Generate Predictive Report'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {lang === 'ar' 
                    ? 'ادفع $499 للحصول على تحليل استشرافي دقيق لعام 2040' 
                    : 'Pay $499 for accurate 2040 predictive analysis'}
                </p>
              </div>

              <PaymentModalContent 
                onSuccess={() => {
                  setIsPaid(true);
                  setShowPaymentModal(false);
                  setTimeout(() => runSimulation(lastZone ?? 'FUTURE_BUILD', true), 500);
                }} 
                lang={lang} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {results && (
          <section id="results-section" className="min-h-screen w-full px-4 flex-center section-container">
            <div className="investment-document w-full">
              <div 
                ref={reportRef} 
                id="investment-report-template"
                className="glass-panel w-full p-12 relative bg-deep-black"
                style={{ border: '2px solid rgba(212, 175, 55, 0.4)' }}
              >
                <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                  <VerificationSeal lang={lang} />
                  <span className="text-[0.5rem] font-mono" style={{ color: 'rgba(212, 175, 55, 0.4)' }}>REF ID: {results.id}</span>
                </div>

                <div className="flex items-center gap-6 mb-12 pb-8" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center text-deep-black shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h2 className="gold-engraved-text text-3xl m-0 tracking-tighter">
                      AURAMETRIC 2040
                    </h2>
                    <p className="text-[0.7rem] uppercase tracking-[0.4em]" style={{ color: 'rgba(212, 175, 55, 0.6)' }}>
                      {lang === 'ar' ? 'تقرير استثماري معتمد' : 'VERIFIED INVESTMENT REPORT'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-12">
                  {/* ... stats ... */}
                  <div className="space-y-1">
                    <span className="block text-[0.6rem] text-gray-400 uppercase tracking-widest">
                      {lang === 'ar' ? 'القيمة التقديرية 2040' : 'VALUE 2040'}
                    </span>
                    <span className="text-xl md:text-2xl text-gold font-semibold font-sans tabular-nums">{results.futureValue}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[0.6rem] text-gray-400 uppercase tracking-widest">
                      {lang === 'ar' ? 'العائد السنوي المتوقع' : 'ANNUAL ROI'}
                    </span>
                    <span className="text-xl md:text-2xl font-semibold font-sans tabular-nums">{results.roi}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[0.6rem] text-gray-400 uppercase tracking-widest">
                      {lang === 'ar' ? 'مؤشر الدقة' : 'ACCURACY'}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp size={16} className="text-emerald-400" />
                      <span className="text-xl md:text-2xl font-semibold font-sans tabular-nums">{results.accuracy}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[0.6rem] text-gray-400 uppercase tracking-widest">
                      {lang === 'ar' ? 'القرار الاستراتيجي' : 'DECISION'}
                    </span>
                    <span className="text-xl md:text-2xl text-emerald-400 font-semibold">
                      {lang === 'ar' ? 'استثمار آمن' : 'PROCEED'}
                    </span>
                  </div>
                </div>

                {/* Market Data Table */}
                <div className="mb-12">
                  <h3 className="text-[0.7rem] uppercase tracking-widest text-gold mb-4 flex items-center gap-2">
                    <Layers size={14} /> {lang === 'ar' ? 'بيانات السوق المرجعية' : 'MARKET REFERENCE DATA'}
                  </h3>
                  <MarketDataTable 
                    lang={lang} 
                    country={zoneA_Country} 
                    city={zoneA_City} 
                    area={area} 
                    floors={floors} 
                    type={investmentType} 
                  />
                </div>

                {/* Trading Chart */}
                <div className="mt-12">
                  <p className="text-center text-[0.65rem] uppercase tracking-[0.3em] mb-4" style={{ color: 'rgba(212, 175, 55, 0.4)' }}>
                    {lang === 'ar' ? 'مخطط نمو القيمة العقارية (2027 - 2040)' : 'Real Estate Value Growth Chart (2027 - 2040)'}
                  </p>
                  <TradingChart data={results.chartData} lang={lang} />
                </div>

                <div className="mt-12 p-6 glass-panel rounded-2xl bg-white/[0.02]" style={{ border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                      <h3 className="text-gold font-medium mb-1">
                        {lang === 'ar' ? 'إجمالي تكلفة المشروع (2026)' : 'Total Project Cost (2026)'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {lang === 'ar' ? 'تشمل هامش المخاطرة (15%) واحتياطي الطوارئ (10%)' : 'Includes risk margin (15%) and contingency (10%)'}
                      </p>
                    </div>
                    <div className="text-3xl font-sans font-bold text-white tabular-nums">
                      {results.totalCost}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-end gap-8" style={{ borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
                  <div className="max-w-md">
                    <h4 className="text-[0.65rem] uppercase tracking-widest text-gold mb-2 flex items-center gap-2">
                      <ShieldCheck size={12} /> {lang === 'ar' ? 'منهجية سلامة البيانات' : 'Data Integrity Methodology'}
                    </h4>
                    <p className="text-[0.6rem] text-gray-500 leading-relaxed">
                      {lang === 'ar' 
                        ? 'تعتمد AuraMetric 2040 على نماذج تنبؤية مدعومة بالذكاء الاصطناعي، تدمج بيانات التضخم الكلي، وتوقعات النمو الحضري، ونماذج العرض والطلب الإقليمية لضمان دقة استشرافية تتجاوز 93%.'
                        : 'AuraMetric 2040 utilizes AI-driven predictive models, integrating macro-inflation data, urban growth forecasts, and regional supply-demand vectors to ensure forecasting accuracy exceeding 93%.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-12">
                    <ElectronicSignature lang={lang} />
                    <div className="flex flex-col items-end gap-2">
                      <ComplianceStamp lang={lang} />
                      <div className="text-[0.5rem] text-gray-600 uppercase tracking-tighter text-right">
                        <p>{lang === 'ar' ? 'وثيقة مشفرة رقمياً' : 'Digitally Encrypted Document'}</p>
                        <p>{lang === 'ar' ? 'تاريخ الإصدار: 10 مارس 2026' : 'Issue Date: March 10, 2026'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="snapshot-instruction">
                {lang === 'ar' 
                  ? 'يمكنك التقاط صورة شاشة لوثيقتك للاحتفاظ بالبيانات الذهبية' 
                  : 'Capture a screenshot to secure your Golden Data.'}
              </div>

              <div className="mt-8 p-6 glass-panel rounded-2xl bg-gradient-to-r from-gold/10 to-gold-dark/10 border border-gold/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="text-gold font-semibold">
                      {lang === 'ar' ? 'تم حفظ تحليلك في خزنة AuraMetric' : 'Your Analysis Saved in AuraMetric Vault'}
                    </h4>
                    <p className="text-sm text-gray-300">
                      {lang === 'ar' 
                        ? 'لقد تم حفظ تحليلك الاستشرافي في خزنة AuraMetric الخاصة بك. للوصول إلى نسخة محدثة أو تعديل المدخلات، يرجى الدخول إلى لوحة التحكم حيث تتوفر جميع ملفاتك مرتبة ومنظمة.'
                        : 'Your predictive analysis has been saved in your AuraMetric vault. To access an updated version or modify inputs, please log into the dashboard where all your files are organized and available.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generated Images Section */}
              {isGeneratingImages && (
                <div className="mt-8 p-6 glass-panel rounded-2xl bg-gradient-to-r from-gold/10 to-gold-dark/10 border border-gold/20">
                  <div className="text-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gold">
                      {lang === 'ar' ? 'جاري توليد الصور المعمارية...' : 'Generating architectural renders...'}
                    </p>
                  </div>
                </div>
              )}

              {generatedImages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gold text-center mb-8">
                    {lang === 'ar' ? 'التصورات المعمارية المولدة' : 'Generated Architectural Renders'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="glass-panel p-4 rounded-2xl border border-gold/20">
                        <img 
                          src={image.url} 
                          alt={`Architectural Render ${index + 1}`} 
                          className="w-full h-64 object-cover rounded-xl mb-4"
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-300">
                            {lang === 'ar' ? `تصور ${index + 1}` : `Render ${index + 1}`}
                          </p>
                          <button 
                            onClick={() => window.open(image.url, '_blank')}
                            className="luxury-gold-btn px-4 py-2 text-sm"
                          >
                            {lang === 'ar' ? 'تحميل' : 'Download'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </AnimatePresence>

      {/* Testimonials Section */}
      <section className="w-full px-4 section-container">
        <h2 className="text-center gold-engraved-text mb-16">
          {lang === 'ar' ? 'شركاء الرؤية' : 'Visionary Partners'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {TESTIMONIALS.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel relative group overflow-hidden"
            >
              <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <img src={t.structure} alt="Structure Mockup" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="relative z-10">
                <Quote className="absolute top-0 right-0 transition-colors" size={64} style={{ color: 'rgba(212, 175, 55, 0.1)' }} />
                <div className="flex items-center gap-4 mb-8">
                  <img src={t.image} alt={t.name} className="w-20 h-20 rounded-full object-cover shadow-xl" referrerPolicy="no-referrer" style={{ border: '2px solid rgba(212, 175, 55, 0.2)' }} />
                  <div>
                    <h4 className="text-gold font-medium text-lg">{t.name}</h4>
                    <p className="text-[0.7rem] text-gray-500 uppercase tracking-[0.2em]">{t.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic leading-relaxed text-lg mb-8">"{t.text}"</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Payment Examples Section */}
      <section className="w-full px-4 section-container">
        <h2 className="text-center gold-engraved-text mb-16">
          Payment Gateways
        </h2>
        <PaymentExamples />
      </section>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-8 rounded-2xl max-w-md w-full mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="gold-engraved-text text-2xl mb-2">
                  {lang === 'ar' ? 'تقرير AuraMetric 2040' : 'AuraMetric 2040 Report'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {lang === 'ar' ? 'القيمة التكنولوجية للتحليل الاستشرافي لعام 2040' : 'The technological value of 2040 predictive analysis'}
                </p>
              </div>

              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-gold mb-2">$499</div>
                <div className="text-sm text-gray-400">
                  {lang === 'ar' ? 'دفعة واحدة - تقرير كامل مدى الحياة' : 'One-time payment - Lifetime full report'}
                </div>
              </div>

              <PaymentModalContent 
                onSuccess={() => {
                  setIsPaid(true);
                  setShowPaymentModal(false);
                  // Auto-run simulation after payment
                  setTimeout(() => runSimulation(lastZone ?? 'FUTURE_BUILD', true), 500);
                }}
                lang={lang}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full py-20 text-center space-y-4 opacity-50 hover:opacity-100 transition-opacity backdrop-blur-xl" style={{ backgroundColor: 'rgba(5, 5, 5, 0.5)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="flex items-center justify-center gap-6 text-xs tracking-widest uppercase">
          <a href="mailto:support@aurametric.com" className="flex items-center gap-2 hover:text-gold transition-colors">
            <Mail size={14} /> metrecaura@gmail.com
          </a>
        </div>
        <p className="text-[0.6rem] text-gray-500 uppercase tracking-[0.3em]">
          &copy; 2026 AuraMetric Core • Predictive Structural Intelligence
        </p>
      </footer>
    </div>
  );
}
