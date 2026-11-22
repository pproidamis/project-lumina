'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, HeartHandshake, BarChart3, UserCog } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'Cockpit', icon: ShieldAlert, active: pathname === '/' || pathname.startsWith('/crisis') },
    { href: '/repair/latest', label: 'Repair', icon: HeartHandshake, active: pathname.startsWith('/repair') },
    { href: '/patterns', label: 'Patterns', icon: BarChart3, active: pathname.startsWith('/patterns') },
    { href: '/profile', label: 'Vault', icon: UserCog, active: pathname.startsWith('/profile') },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800/90">
      <div className="max-w-lg mx-auto grid grid-cols-4 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                item.active ? 'text-[#F59E0B]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
