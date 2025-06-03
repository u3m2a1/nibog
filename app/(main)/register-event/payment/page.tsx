'use client';

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initiatePhonePePayment } from '@/services/paymentService';
import { Loader2 } from 'lucide-react';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  CreditCard, 
  Landmark, 
  Smartphone, 
  Wallet, 
  SmartphoneCharging, 
  DollarSign 
} from 'lucide-react';
import Image from 'next/image';

type PaymentMethod = 'netbanking' | 'card' | 'upi' | 'wallet' | 'emi' | null;
type BankOption = 'axis' | 'sbi' | 'hdfc' | 'icici' | 'other';

type PaymentOption = {
  id: string;
  type: PaymentMethod;
  title: string;
  icon: React.ReactNode;
  description?: string;
  popularBanks?: { id: string; name: string; logo: string }[];
  allBanks?: { id: string; name: string; logo: string }[];
};

const PaymentOptionCard = ({
  option,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: {
  option: PaymentOption;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) => {
  const hasSubOptions = option.popularBanks && option.popularBanks.length > 0;
  
  return (
    <div className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-slate-800' : ''}`}
        onClick={hasSubOptions ? onToggleExpand : onSelect}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 dark:bg-slate-700' : 'bg-gray-100 dark:bg-slate-800'}`}>
            {option.icon}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{option.title}</div>
            {option.description && (
              <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
            )}
          </div>
        </div>
        
        {hasSubOptions ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        ) : (
          <div className="w-5"></div> // Spacer for alignment
        )}
      </div>
      
      {isExpanded && hasSubOptions && (
        <div className="pl-16 pr-4 pb-4 -mt-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">POPULAR BANKS</div>
          <div className="space-y-2">
            {option.popularBanks?.map((bank) => (
              <div 
                key={bank.id}
                className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 dark:border-slate-600 flex items-center justify-center mr-3">
                  <Image 
                    src={bank.logo} 
                    alt={bank.name} 
                    width={16} 
                    height={16} 
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium">{bank.name}</span>
                <div className="ml-auto text-gray-400">
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
          
          {option.allBanks && option.allBanks.length > 0 && (
            <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
              View all {option.allBanks.length} banks
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const paymentOptions: PaymentOption[] = [
  {
    id: 'netbanking',
    type: 'netbanking',
    title: 'Netbanking',
    icon: <Landmark size={20} className="text-blue-600" />,
    description: 'Pay via Netbanking',
    popularBanks: [
      { id: 'axis', name: 'Axis Bank', logo: '/banks/axis.png' },
      { id: 'sbi', name: 'State Bank of India', logo: '/banks/sbi.png' },
      { id: 'icici', name: 'ICICI Bank', logo: '/banks/icici.png' },
    ],
    allBanks: [
      { id: 'hdfc', name: 'HDFC Bank', logo: '/banks/hdfc.png' },
      { id: 'kotak', name: 'Kotak Mahindra Bank', logo: '/banks/kotak.png' },
      { id: 'yes', name: 'Yes Bank', logo: '/banks/yes.png' },
    ]
  },
  {
    id: 'cards',
    type: 'card',
    title: 'Credit / Debit / ATM Card',
    icon: <CreditCard size={20} className="text-purple-600" />,
    description: 'Pay using any Visa, Mastercard, Rupay, Amex',
    popularBanks: [
      { id: 'visa', name: 'Visa', logo: '/cards/visa.png' },
      { id: 'mastercard', name: 'Mastercard', logo: '/cards/mastercard.png' },
      { id: 'rupay', name: 'RuPay', logo: '/cards/rupay.png' },
    ]
  },
  {
    id: 'upi',
    type: 'upi',
    title: 'UPI',
    icon: <SmartphoneCharging size={20} className="text-indigo-600" />,
    description: 'Pay using any UPI app',
    popularBanks: [
      { id: 'gpay', name: 'Google Pay', logo: '/upi/gpay.png' },
      { id: 'phonepe', name: 'PhonePe', logo: '/upi/phonepe.png' },
      { id: 'paytm', name: 'Paytm', logo: '/upi/paytm.png' },
    ]
  },
  {
    id: 'wallet',
    type: 'wallet',
    title: 'Wallets',
    icon: <Wallet size={20} className="text-amber-600" />,
    popularBanks: [
      { id: 'mobikwik', name: 'Mobikwik', logo: '/wallets/mobikwik.png' },
      { id: 'airtel', name: 'Airtel Payments Bank', logo: '/wallets/airtel.png' },
      { id: 'freecharge', name: 'Freecharge', logo: '/wallets/freecharge.png' },
    ]
  },
  {
    id: 'emi',
    type: 'emi',
    title: 'EMI',
    icon: <DollarSign size={20} className="text-green-600" />,
    description: 'Pay in easy installments',
    popularBanks: [
      { id: 'zest', name: 'ZestMoney', logo: '/emi/zest.png' },
      { id: 'bajaj', name: 'Bajaj Finserv', logo: '/emi/bajaj.png' },
      { id: 'hdfc-emi', name: 'HDFC EMI', logo: '/emi/hdfc.png' },
    ]
  }
];

export default function PaymentMethodPage() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get booking details from URL or state
  const bookingId = searchParams.get('bookingId');
  const eventName = searchParams.get('eventName') || 'Event';
  const eventId = searchParams.get('eventId') || '';
  const userId = 'user123'; // TODO: Get from auth context
  const amount = Number(searchParams.get('amount')) || 0;
  const mobileNumber = searchParams.get('mobileNumber') || '';
  
  // Generate a unique user ID if not available
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = `user_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', userId);
      }
      return userId;
    }
    return 'guest_user';
  };
  
  // Sample event details - replace with actual data from your state/context
  const eventDetails = {
    name: 'Summer Music Festival',
    date: 'June 15, 2025',
    time: '6:00 PM',
    venue: 'City Center Arena',
    tickets: [
      { type: 'General Admission', quantity: 2, price: 2500, total: 5000 },
      { type: 'Service Fee', quantity: 1, price: 200, total: 200 }
    ],
    subtotal: 5000,
    fees: 200,
    total: 5200
  };

  const handleContinue = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }
    
    if (!bookingId) {
      setError('Invalid booking reference');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log(`Initiating payment for booking ${bookingId}...`);
      
      // Get or generate user ID
      const userId = getUserId();
      
      // Initiate PhonePe payment
      const paymentUrl = await initiatePhonePePayment(
        bookingId,
        userId,
        amount,
        mobileNumber
      );
      
      console.log('Redirecting to PhonePe:', paymentUrl);
      
      // Redirect to PhonePe payment page
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error('Failed to get payment URL from PhonePe');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to success page or next step
      // router.push('/booking-confirmation');
      alert(`Payment method selected: ${selectedMethod}`);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOption = (optionId: string) => {
    setExpandedOption(expandedOption === optionId ? null : optionId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-1 rounded-full hover:bg-blue-700"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Nibog</h1>
          <div className="w-8">
            {/* Placeholder for profile/avatar */}
          </div>
        </div>
        <div className="text-center py-2 text-sm bg-blue-700 mt-2">
          Secured by PhonePe
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Payment Options</h2>
        
        {/* Payment Options */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Recommended Payment Methods</h3>
          </div>
          
          {paymentOptions
            .filter(option => option.type === 'netbanking' || option.type === 'card')
            .map((option) => (
              <PaymentOptionCard
                key={option.id}
                option={option}
                isSelected={selectedMethod === option.type}
                isExpanded={expandedOption === option.id}
                onSelect={() => setSelectedMethod(option.type)}
                onToggleExpand={() => toggleOption(option.id)}
              />
            ))}
        </div>
        
        {/* All Payment Options */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">All Payment Options</h3>
          </div>
          
          {paymentOptions.map((option) => (
            <PaymentOptionCard
              key={option.id}
              option={option}
              isSelected={selectedMethod === option.type}
              isExpanded={expandedOption === option.id}
              onSelect={() => setSelectedMethod(option.type)}
              onToggleExpand={() => toggleOption(option.id)}
            />
          ))}
        </div>
      </main>

      {/* Payment Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 shadow-lg">
        {error && (
          <div className="mb-3 p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <span>Total</span>
            <button 
              onClick={() => {}}
              className="ml-2 text-sm text-blue-600 dark:text-blue-400 flex items-center"
            >
              View Details
              <ChevronUp className="ml-1 w-4 h-4" />
            </button>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ₹{amount.toLocaleString()}
          </div>
        </div>
        
        <button
          onClick={handleContinue}
          disabled={!selectedMethod || isProcessing}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            ${
              !selectedMethod || isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-900'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black
            transition-colors duration-200 flex items-center justify-center
          `}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Continue to Payment'
          )}
        </button>
      </div>
    </div>
  );
}
