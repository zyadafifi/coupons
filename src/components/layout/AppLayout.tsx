import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { CountryPickerModal } from '@/components/home/CountryPickerModal';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <main className="h-screen pb-20 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {children}
        </div>
      </main>
      <BottomNav />
      <CountryPickerModal />
    </div>
  );
}
