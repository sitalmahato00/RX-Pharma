import { ReactNode } from 'react';
import Logo from '@/components/ui/Logo';

export default function BareLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <div className="flex items-center justify-between px-6 py-5">
                <Logo />
                <a
                    href="/"
                    className="text-sm font-medium text-muted hover:text-primary-700 transition-colors"
                >
                    Back to home
                </a>
            </div>
            <div className="flex flex-1 items-center justify-center px-4 pb-16">
                {children}
            </div>
        </div>
    );
}