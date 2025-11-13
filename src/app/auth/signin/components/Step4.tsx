import React from 'react';
import Button from './Button';

interface Step4Props {
  name: string;
  setName: (e: string) => void;
  toNext: () => void;
}

const Step4 = ({ name, setName, toNext }: Step4Props) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      {/* Title */}
      <h2 className="text-accent-leaf-green font-dela mb-4 text-4xl font-bold tracking-tight">
        Claim your foodie identity.
      </h2>

      {/* Subtitle */}
      <p className="mb-6 max-w-xs text-base leading-tight tracking-tight text-slate-600">
        Tell us who you are, and we'll unlock your personalized Food Hack.
      </p>

      {/* Input + Button */}
      <div className="w-full space-y-5">
        {/* Material 3 styled input */}
        <div className="relative">
          <input
            type="text"
            placeholder=" "
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`peer border-accent-leaf-green w-full rounded-lg border-2 bg-white px-4 pt-5 text-lg text-slate-900 shadow-sm focus:border-[#002a01] focus:ring-2 focus:ring-[#002a01] focus:outline-none ${name ? 'pb-2' : 'focus:pb-2'}`}
          />
          <label className="absolute top-2 left-4 text-sm tracking-tight text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-slate-300">
            Enter Your Name
          </label>
        </div>

        <Button
          buttonText="Next →"
          onClick={toNext}
          disabled={!name.trim()}
          className="w-full disabled:opacity-50"
        />
      </div>
    </div>
  );
};

export default Step4;
