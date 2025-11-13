import Button from './Button';

interface Step5Props {
  phone: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  startPhoneFlow: () => void;
  error: string;
}

const Step5 = ({
  phone,
  handlePhoneChange,
  isLoading,
  startPhoneFlow,
  error,
}: Step5Props) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Title */}
      <h2 className="text-accent-leaf-green font-dela mb-4 text-4xl font-bold tracking-tight">
        Keep your #FoodHacks safe.
      </h2>

      {/* Subtitle */}
      <p className="mb-6 max-w-xs text-base leading-tight tracking-tight text-slate-600">
        Enter your number and we'll send a one-time code to sign in securely.
      </p>

      {/* Input + Button */}
      <div className="w-full space-y-5">
        {/* Material 3 styled input */}
        <div className="relative">
          <input
            type="tel"
            placeholder=" "
            value={phone}
            onChange={handlePhoneChange}
            className={`peer border-accent-leaf-green w-full rounded-lg border-2 bg-white px-4 pt-5 text-lg tracking-tight text-slate-900 shadow-sm focus:border-[#002a01] focus:ring-2 focus:ring-[#002a01] focus:outline-none ${phone ? 'pb-2' : 'focus:pb-2'}`}
          />
          <label className="absolute top-2 left-4 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-slate-300">
            Phone number
          </label>
        </div>

        {/* Hidden reCAPTCHA container - invisible reCAPTCHA handles itself */}
        <div id="recaptcha-container" className="hidden" />

        {/* Material 3 expressive button */}
        <Button
          buttonText={isLoading ? 'Sending…' : 'Send OTP'}
          onClick={startPhoneFlow}
          disabled={isLoading || phone.length < 8}
          className="w-full disabled:opacity-50"
        />

        {/* Error message */}
        {error && (
          <p className="pt-2 text-sm font-medium text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Step5;
