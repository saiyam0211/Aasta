import Lottie from 'lottie-react';
import React from 'react';

interface SignInStepProps {
  lottieAnimation: object;
  heading: string;
  subHeading: string;
  buttonText: string;
  toNext: () => void;
  isSkip?: boolean;
  toSkip?: () => void;
}

const SignInStep = ({
  lottieAnimation,
  heading,
  subHeading,
  buttonText,
  toNext,
}: SignInStepProps) => {
  return (
    <div className="flex h-full flex-col items-center text-center">
      <div className="mb-2 w-full scale-110">
        <Lottie
          animationData={lottieAnimation as any}
          loop
          autoplay
          style={{ width: '100%', height: 280 }}
        />
      </div>
      <h2 className="font-dela text-accent-leaf-green mb-6 text-[36px] leading-10">
        {heading}
      </h2>
      <p className="text-off-white mx-auto max-w-sm text-sm font-medium tracking-normal">
        {subHeading}
      </p>
      <div className="mt-4 w-full">
        <button
          onClick={toNext}
          className="text-primary-dark-green bg-accent-leaf-green font-dela mx-auto flex w-fit items-center justify-center rounded-lg border-3 border-black px-5 py-4 text-sm"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SignInStep;
