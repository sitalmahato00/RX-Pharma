import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AdminLayout from './layouts/AdminLayout';
import BareLayout from './layouts/BareLayout';
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import { ToastProvider } from './components/ui/Toast';

function resolveLayout(name: string) {
    if (name.startsWith('Admin/Auth')) return BareLayout;
    if (name.startsWith('Auth')) return BareLayout;
    if (name.startsWith('Admin')) return AdminLayout;
    if (name.startsWith('Student')) return StudentLayout;
    return PublicLayout;
}

createInertiaApp({
    title: (title) => (title ? `${title} — RX Pharma` : 'RX Pharma'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: ((name: string) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const page = pages[`./pages/${name}.tsx`]();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (page as any).then((mod: any) => {
            if (mod.default && !mod.default.layout) {
                mod.default.layout = resolveLayout(name);
            }
        });
        return page;
    }) as any,
    setup({ el, App, props }) {
        if (!el) return;
        createRoot(el).render(
            <ToastProvider>
                <App {...props} />
            </ToastProvider>
        );
    },
    progress: {
        delay: 150,
        color: '#0B63CE',
        includeCSS: true,
        showSpinner: false,
    },
});