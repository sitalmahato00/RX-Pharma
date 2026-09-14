import { createInertiaApp } from '@inertiajs/react';
import ReactDOMServer from 'react-dom/server';

// SSR entry (disabled in vite config via `inertia({ ssr: false })`).
export default function render(page: any) {
    return createInertiaApp({
        page,
        title: (title) => (title ? `${title} — RX Pharma` : 'RX Pharma'),
        render: ReactDOMServer.renderToString,
        resolve: ((name: string) => {
            const pages = import.meta.glob('./pages/**/*.tsx');
            return pages[`./pages/${name}.tsx`]();
        }) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setup: ({ App, props }: any) => <App {...props} />,
    });
}