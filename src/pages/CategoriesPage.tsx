import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CategoriesPageProps { onNavigate: (route: string) => void; }

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const { categories, products } = useStore();
  const visibleCategories = categories.filter((category) => category.active);
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-category text-3xl font-black  tracking-tight">Όλες οι κατηγορίες</h1>
        <p className="mt-1 text-sm text-neutral-600">Περιηγηθείτε σε όλες τις κατηγορίες και υποκατηγορίες προϊόντων.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visibleCategories.map((category) => {
          const count = products.filter((product) => product.categoryIds.includes(category.id)).length;
          return <button key={category.id} onClick={() => onNavigate(`/category/${category.slug}`)} className="group relative min-h-56 overflow-hidden rounded-2xl border border-[#cfd8dc] bg-[#b8b8b8] text-left text-white shadow-sm transition hover:border-[#e21b22]">
            <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-contain grayscale opacity-65 transition group-hover:scale-105 group-hover:grayscale-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 transition group-hover:bg-[#e21b22]/50" />
            <div className="relative z-10 flex min-h-56 flex-col justify-end p-4">
              <h2 className="font-category text-lg font-bold  leading-tight">{category.name}</h2>
              <span className="mt-1 text-xs text-neutral-200">{count} προϊόντα</span>
              <ArrowRight className="mt-2 h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
            </div>
          </button>;
        })}
      </div>
    </div>
  );
};

