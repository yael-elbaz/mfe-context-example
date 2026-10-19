import React, { lazy, Suspense, useEffect, useState } from 'react';
import type { EmployeePickerPopupProps } from '../hooks/useEmployeePickerPopup';
import type { PersonType } from '../types/openService';
import iconClose from '../assets/icons/icon-close.svg';
import iconSearch from '../assets/icons/icon-search.svg';

const SearchEmployeeMFE = lazy(() => import('mfe_search_employee/App'));

const EmployeePickerPopup: React.FC<EmployeePickerPopupProps> = ({ open, objectType, onSelected, onClose }) => {
  const [picked, setPicked] = useState<{ idnt: string; personType: PersonType } | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // איפוס הבחירה בכל פתיחה מחדש
  useEffect(() => {
    if (open) setPicked(null);
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (picked) onSelected(picked.idnt, picked.personType);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45"
    >
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-picker-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-[560px] max-w-[90vw] flex-col items-start rounded-[8px] bg-white px-[16px] py-[32px] shadow-[0px_2px_6px_0px_#00000026]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="סגור"
          className="size-[20px] shrink-0 cursor-pointer self-end"
        >
          <img src={iconClose} alt="" className="size-full" />
        </button>

        <div className="relative flex w-full shrink-0 flex-col items-center gap-[40px]">
          <p
            id="employee-picker-title"
            className="w-full text-center text-[20px] font-bold leading-[1.25] text-navy [word-break:break-word]"
          >
            אתר משתמש עבור השירות
          </p>

          <div className="flex w-full shrink-0 flex-col items-start gap-[40px]">
            <div className="flex w-full shrink-0 flex-col items-center gap-[8px]">
              <span className="w-full text-right text-[16px] font-normal leading-[1.25] text-navy [word-break:break-word]">
                אתר אדם
              </span>

              {/* מחלקת הנטרול של מעטפת ה-MFE מוגדרת ב-index.css */}
              <div className="employee-picker-mfe relative w-full shrink-0">
                <Suspense
                  fallback={
                    <div className="flex h-[64px] items-center justify-center rounded-[8px] border border-solid border-blue-outline text-[16px] leading-[1.25] text-gray-muted">
                      טוען חיפוש עובד...
                    </div>
                  }
                >
                  <SearchEmployeeMFE
                    onSelected={(idnt: string, personType: PersonType) => setPicked({ idnt, personType })}
                    objectType={objectType}
                  />
                </Suspense>
                <img
                  src={iconSearch}
                  alt=""
                  className="pointer-events-none absolute top-[20px] right-[16px] size-[24px]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={!picked}
              className="flex h-[48px] shrink-0 items-center justify-center self-end rounded-[8px] bg-blue-action px-[24px] py-[12px] text-[16px] font-semibold leading-[1.25] whitespace-nowrap text-white enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              מעבר לשירות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePickerPopup;
