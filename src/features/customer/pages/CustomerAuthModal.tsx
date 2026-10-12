import React, { useState } from 'react';
import { useStore } from '../../../store';
import { X, Mail, KeyRound, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setCurrentUser, addToast } = useStore();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (targetEmail = email) => {
    if (!targetEmail.trim() || !targetEmail.includes('@')) {
      addToast({
        type: 'error',
        message: 'Please provide a valid email address.',
      });
      return;
    }
    setIsLoading(true);

    // Generate random 6-digit OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      addToast({
        type: 'success',
        title: '6-Digit OTP Dispatched',
        message: `Your one-time passkey is: ${mockOtp} (Enter below or click autofill)`,
        duration: 9000,
      });
    }, 400);
  };

  const handleFillDemoUser = () => {
    setEmail(APP_CONFIG.demoUsers.customer.email);
    setName(APP_CONFIG.demoUsers.customer.name);
    handleSendOtp(APP_CONFIG.demoUsers.customer.email);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Pasted full code
      const pasted = val.slice(0, 6).split('');
      const newOtp = [...enteredOtp];
      pasted.forEach((char, i) => {
        newOtp[i] = char;
      });
      setEnteredOtp(newOtp);
      return;
    }
    const newOtp = [...enteredOtp];
    newOtp[index] = val;
    setEnteredOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAutofillGenerated = () => {
    if (generatedOtp) {
      setEnteredOtp(generatedOtp.split(''));
    }
  };

  const handleVerifyOtp = () => {
    const fullCode = enteredOtp.join('');
    if (fullCode.length !== 6) {
      addToast({
        type: 'error',
        message: 'Please enter all 6 digits of the OTP.',
      });
      return;
    }

    if (fullCode === generatedOtp || fullCode === '123456') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setCurrentUser({
          id: 'user_alex',
          name: name || APP_CONFIG.demoUsers.customer.name,
          email: email || APP_CONFIG.demoUsers.customer.email,
          role: 'customer',
          avatar: APP_CONFIG.demoUsers.customer.avatar,
          addresses: [],
          createdAt: new Date().toISOString(),
        });
        addToast({
          type: 'success',
          title: 'Welcome to Kartova!',
          message: 'Signed in successfully. Your bag and orders are synced.',
        });
        onClose();
        setStep('email');
      }, 500);
    } else {
      addToast({
        type: 'error',
        title: 'Incorrect Passkey',
        message: `Code does not match. Expected: ${generatedOtp}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden p-6 z-10 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#FF6B4A]/20">
            {step === 'email' ? <Mail size={22} /> : <KeyRound size={22} />}
          </div>
          <h2 className="text-xl font-bold font-display text-stone-950">
            {step === 'email' ? 'Sign in to Kartova' : 'Verify Your Identity'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {step === 'email'
              ? 'Passwordless security with 6-digit one-time passkey'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <div className="space-y-4">
            {/* 1-Click Demo Login Banner */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#FF6B4A]" />
                  <span className="text-xs font-bold text-stone-900">
                    Reviewer Demo Login
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoUser}
                  className="px-2.5 py-1 text-[11px] font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>1-Tap Demo</span>
                  <ArrowRight size={11} />
                </button>
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                Pre-fills Alex Morgan (has active orders & saved addresses).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#FF6B4A]"
              />
            </div>

            <button
              onClick={() => handleSendOtp()}
              disabled={isLoading}
              className="w-full btn-brand-primary py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Sending Passkey...' : 'Continue with Email'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OTP Autofill helper banner */}
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
              <div className="text-xs text-teal-900 font-medium">
                Passkey sent: <span className="font-mono font-bold">{generatedOtp}</span>
              </div>
              <button
                type="button"
                onClick={handleAutofillGenerated}
                className="px-2.5 py-1 text-[11px] font-bold text-teal-900 bg-teal-200/70 hover:bg-teal-300 rounded-md transition-colors"
              >
                Autofill
              </button>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-between gap-2">
              {enteredOtp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-bold font-mono bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FF6B4A] focus:bg-white"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading}
              className="w-full btn-brand-primary py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <ShieldCheck size={16} />
              <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
            </button>

            <div className="flex justify-between text-xs text-stone-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="hover:text-stone-900 font-medium"
              >
                Change Email
              </button>
              <button
                type="button"
                onClick={() => handleSendOtp()}
                className="text-[#FF6B4A] hover:underline font-semibold"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
