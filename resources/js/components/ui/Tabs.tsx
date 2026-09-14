import { cn } from '@/lib/utils';

export interface TabItem {
    label: string;
    value: string;
}

interface TabsProps {
    tabs: TabItem[];
    value: string;
    onChange: (value: string) => void;
}

export default function Tabs({ tabs, value, onChange }: TabsProps) {
    return (
        <div role="tablist" className="flex items-center gap-1 overflow-x-auto border-b border-slate-200">
            {tabs.map((tab) => {
                const active = tab.value === value;
                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(tab.value)}
                        className={cn(
                            'bg-transparent px-4 py-2.5 text-sm transition',
                            active
                                ? 'border-b-2 border-primary-600 font-medium text-primary-700'
                                : 'border-b-2 border-transparent text-muted hover:text-ink'
                        )}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}