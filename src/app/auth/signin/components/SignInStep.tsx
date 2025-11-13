import Lottie from 'lottie-react';
import React from 'react';
import Button from './Button';

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
        <Button buttonText={buttonText} onClick={toNext} />
      </div>
    </div>
  );
};

export default SignInStep;
