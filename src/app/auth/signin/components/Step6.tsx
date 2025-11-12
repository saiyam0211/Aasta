import Button from './Button';

interface Step6Props {
  otp: string;
  setOtp: (arg: string) => void;
  isLoading: boolean;
  verifyOtp: () => void;
  error: string;
}

const Step6 = ({ otp, setOtp, isLoading, verifyOtp, error }: Step6Props) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Title */}
      <h2 className="text-accent-leaf-green font-dela mb-4 text-4xl font-bold tracking-tight">
        Almost there!
      </h2>

      {/* Subtitle */}
      <p className="mb-6 max-w-xs text-base leading-tight tracking-tight text-slate-600">
        We sent your secret code to{' '}
        {/* <span className="font-medium text-slate-800">
                {phone.trim().startsWith('+') ? phone : `+91${phone}`}
              </span> */}
        — enter it to unlock your #FoodHacks.
      </p>

      {/* 6-digit OTP input */}
      <div className="mb-5 flex justify-center space-x-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i] || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/, '');
              if (!val) return;
              const newOtp = otp.split('');
              newOtp[i] = val;
              setOtp(newOtp.join(''));
              // move focus to next box
              if (i < 5) {
                const next = document.getElementById(`otp-${i + 1}`);
                next?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                const newOtp = otp.split('');
                newOtp[i] = '';
                setOtp(newOtp.join(''));
                if (i > 0 && !otp[i]) {
                  const prev = document.getElementById(`otp-${i - 1}`);
                  prev?.focus();
                }
              }
            }}
            id={`otp-${i}`}
            className="h-14 w-12 rounded-lg border border-slate-300 text-center text-xl font-medium text-accent-leaf-green font-dela shadow-sm transition focus:border-[#002a01] focus:ring-2 focus:ring-[#002a01] focus:outline-none"
          />
        ))}
      </div>

      {/* Verify button */}
      <Button
        buttonText={isLoading ? 'Verifying…' : 'Verify & Continue'}
        onClick={verifyOtp}
        disabled={isLoading || otp.length < 6}
        className="disabled:opacity-50 w-full"
      />

      {/* Error message */}
      {error && (
        <p className="pt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Step6;
