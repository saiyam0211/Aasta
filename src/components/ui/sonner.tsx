'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position={props.position ?? 'top-center'}
      closeButton={props.closeButton ?? true}
      duration={props.duration ?? 2000}
      className={`toaster group pointer-events-none z-[60] ${props.className ?? ''}`}
      toastOptions={{
        className:
          'glass-liquid bg-white/70 text-black border border-black/10 shadow-lg pointer-events-auto',
        classNames: {
          title: 'font-semibold',
          description: 'text-sm text-gray-800',
          actionButton: 'glass-liquid bg-[#002A01] text-white',
          cancelButton: 'glass-liquid bg-white/60 text-black',
        },
        style: {
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        },
      }}
      style={{
        ...(props.style as any),
        // ensure our CSS variables still map for themes, but provide visible defaults
        ['--normal-bg' as any]: 'var(--popover, rgba(255,255,255,0.7))',
        ['--normal-text' as any]: 'var(--popover-foreground, #101113)',
        ['--normal-border' as any]: 'var(--border, rgba(0,0,0,0.1))',
        // nudge up from bottom nav
        marginTop: '20px',
      }}
      {...props}
    />
  );
};

export { Toaster };
