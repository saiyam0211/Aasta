import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button = ({
  buttonText,
  onClick,
  disabled,
  className,
  ...rest
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'text-primary-dark-green bg-accent-leaf-green font-dela mx-auto flex w-fit items-center justify-center rounded-lg border-3 border-black px-5 py-4 text-sm',
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {buttonText}
    </button>
  );
};

export default Button;
