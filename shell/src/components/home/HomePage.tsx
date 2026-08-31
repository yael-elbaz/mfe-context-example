import React, { lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PersonType } from '../../types/openService';
import { mfe } from '../MfeSlot';
import FavoritesCard from './FavoritesCard';
import ReportsCard from './ReportsCard';

const SearchPersonMFE = lazy(() => import('mfe_search_employee/App'));
const TasksMFE = lazy(() => import('mfe_tasks/App'));
const SherutimPreviewMFE = lazy(() => import('mfe_sherutim/Preview'));

interface Props {
  openService?: (meta: Record<string, any>) => void;
}

/**
 * דף הבית — פריסת שתי עמודות לפי העיצוב (Figma 17:11865):
 * בצד ימין (עמודה ראשית): חיפוש אדם, מטלות (מונים + טבלה) ושרותים.
 * בצד שמאל: שני ה-MFE שטרם פותחו (Placeholders עם נתונים קשיחים).
 */
const HomePage: React.FC<Props> = ({ openService }) => {
  const navigate = useNavigate();

  const onSelected = useCallback((id: string, personType: PersonType) => {
    if (personType === 'employee') navigate(`/employee-portfolio?employeeId=${id}`);
    if (personType === 'customer') navigate(`/customer-portfolio?customerId=${id}`);
  }, [navigate]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F6F9FC] px-10 pb-10 pt-[calc(var(--header-height)_+_64px)]">
      <div className="flex flex-col gap-8 xl:flex-row">
        {/* עמודה ראשית — ימין */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* שדה החיפוש — מיושר לקצה הימני של העמודה, 528px לפי העיצוב */}
          <div className="mb-8 w-full max-w-[528px]">
            <Suspense fallback={<div className="text-[14px] text-[#8E929F]">טוען חיפוש...</div>}>
              <SearchPersonMFE onSelected={onSelected} />
            </Suspense>
          </div>

          <div className="flex flex-col gap-6">
            {mfe('טוען מודול משימות...', TasksMFE, { openService })}
            {mfe('טוען שירותים...', SherutimPreviewMFE, {
              openService,
              onShowAll: () => navigate('/sherutim'),
            })}
          </div>
        </div>

        {/* עמודה משנית — שמאל (MFEs עתידיים) */}
        <aside className="flex w-full shrink-0 flex-col gap-6 xl:w-[390px]">
          <FavoritesCard />
          <ReportsCard />
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
