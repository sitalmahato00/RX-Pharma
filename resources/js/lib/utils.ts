export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US', { notation: value >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value);
}

export function timeAgo(date?: string | null): string {
    if (!date) return '';
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

export function formatDate(date?: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDuration(seconds?: number | null): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function initials(name?: string | null): string {
    if (!name) return 'U';
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function truncate(text: string, length = 120): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '…';
}

export function resourceTypeLabel(type: string): string {
    const map: Record<string, string> = {
        note: 'Note',
        video: 'Video',
        literature: 'Literature',
        previous_paper: 'Previous Paper',
        practical: 'Practical & Viva',
    };
    return map[type] ?? type;
}

export function resourceTypeRoute(type: string): string {
    const map: Record<string, string> = {
        note: 'notes',
        video: 'videos',
        literature: 'literature',
        previous_paper: 'previous-papers',
        practical: 'practical-viva',
    };
    return map[type] ?? type;
}

export function modelTypeToRoute(modelClass: string): string {
    if (modelClass.includes('Quiz')) return 'quizzes';
    return 'resources';
}