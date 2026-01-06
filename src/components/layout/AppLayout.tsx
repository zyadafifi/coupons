import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { CountryPickerModal } from '@/components/home/CountryPickerModal';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="pb-20">
        {children}
      </main>
      <BottomNav />
      <CountryPickerModal />
    </div>
  );
}
