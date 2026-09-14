import { useEffect, useState } from 'react';

interface MediaPreviewProps {
    source?: File | string | null;
    type: 'image' | 'pdf';
    label?: string;
}

function isFileSource(source: File | string): source is File {
    return typeof File !== 'undefined' && source instanceof File;
}

function sourceUrl(source: File | string): string {
    if (isFileSource(source)) return URL.createObjectURL(source);
    if (typeof source !== 'string') return '';
    if (/^(https?:\/\/|\/)/.test(source)) return source;
    return `/storage/${source}`;
}

export default function MediaPreview({ source, type, label }: MediaPreviewProps) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!source) {
            setUrl(null);
            return;
        }

        const previewUrl = sourceUrl(source);
        setUrl(previewUrl);

        return () => {
            if (isFileSource(source)) URL.revokeObjectURL(previewUrl);
        };
    }, [source]);

    if (!url) return null;

    return (
        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {label && <p className="border-b border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">{label}</p>}
            {type === 'image' ? (
                <img src={url} alt={label ?? 'Image preview'} className="max-h-48 w-full object-contain p-2" />
            ) : (
                <>
                    {url.toLowerCase().includes('.pdf') || (!!source && isFileSource(source) && source.type === 'application/pdf') ? (
                        <iframe title={label ?? 'PDF preview'} src={url} className="h-64 w-full" />
                    ) : (
                        <a href={url} target="_blank" rel="noreferrer" className="block px-3 py-4 text-sm font-medium text-primary-700 hover:bg-primary-50">
                            Open document preview
                        </a>
                    )}
                </>
            )}
        </div>
    );
}
