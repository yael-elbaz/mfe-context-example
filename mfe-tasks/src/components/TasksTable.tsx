import React from 'react';
import { ChevronLeftIcon, FlagIcon } from './icons';
import type { Task, TaskStatus } from '../types';

/** צבעי תגיות הסטטוס — לפי הווריאנטים של status event ב-Figma */
const STATUS_STYLE: Record<TaskStatus, string> = {
  'unit-read': 'bg-[#EFF4FF] border border-[#C6DAF6] text-[#2864C8] text-[12px] leading-4 tracking-[0.4px]',
  open:        'bg-[#E6F4EA] border border-[#A3D9B1] text-[#1B7B3A] text-[12px] leading-4 tracking-[0.4px]',
  returned:    'bg-[#F3EBFD] text-[#7C3AED] text-[14px] font-medium leading-5 tracking-[0.1px]',
  managed:     'bg-[#FDF3E0] border border-[#E8C77A] text-[#8A6100] text-[12px] leading-4 tracking-[0.4px]',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  'unit-read': 'נקרא ע”י יחידה',
  open: 'פתוח',
  returned: 'הוחזר לנקודת זקיפות',
  managed: 'מתנהל',
};

const StatusTag: React.FC<{ status: TaskStatus }> = ({ status }) => (
  <span
    className={`flex items-center justify-center overflow-hidden rounded-[999px] px-[10px] py-0.5 whitespace-nowrap font-normal ${STATUS_STYLE[status]}`}
  >
    {STATUS_LABEL[status]}
  </span>
);

/** תא בשורת נתונים — padding 16, גובה פנימי 28, טקסט 14 */
const Cell: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <td className={`p-4 align-middle ${className ?? ''}`}>
    <div className="flex h-7 items-center justify-end p-1">
      <div className="w-full text-right text-[14px] font-normal leading-5 text-[#00033D]">{children}</div>
    </div>
  </td>
);

const HeadCell: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <th scope="col" className={`px-4 py-2 ${className ?? ''}`}>
    <div className="flex h-7 items-center justify-end p-1">
      <div className="w-full text-right text-[14px] font-medium leading-none text-[#00033D]">{children}</div>
    </div>
  </th>
);

interface Props {
  tasks: Task[];
  onRowClick?: (task: Task) => void;
}

/** טבלת המטלות — Figma 17:11936 */
export const TasksTable: React.FC<Props> = ({ tasks, onRowClick }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-[#E2E8F0]">
    <table className="w-full table-fixed border-collapse">
      <colgroup>
        <col />
        <col />
        <col />
        <col className="w-[174px]" />
        <col />
        <col className="w-[95px]" />
        <col className="w-[168px]" />
        <col className="w-[96px]" />
      </colgroup>
      <thead>
        <tr className="h-11 bg-[#F0F6FD]">
          <HeadCell>שלב המטלה</HeadCell>
          <HeadCell>שם המטלה</HeadCell>
          <HeadCell>נושא</HeadCell>
          <HeadCell>בעינינו של</HeadCell>
          <HeadCell>תאריך</HeadCell>
          <HeadCell>שעה</HeadCell>
          <HeadCell>סטטוס</HeadCell>
          <th />
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr
            key={task.id}
            onClick={() => onRowClick?.(task)}
            className="h-[60px] border-b-[0.5px] border-[#E2E8F0] bg-white last:border-b-0 hover:bg-[#F8F9FD]"
          >
            <Cell>{task.stage}</Cell>
            <Cell>{task.name}</Cell>
            <Cell>{task.subject}</Cell>
            <Cell>{task.owner}</Cell>
            <Cell>{task.date}</Cell>
            <Cell>{task.time}</Cell>
            <td className="p-4 align-middle">
              <div className="flex items-center justify-end">
                <StatusTag status={task.status} />
              </div>
            </td>
            <td className="px-2 align-middle">
              <div className="flex items-center justify-center gap-4 px-4">
                <FlagIcon />
                <ChevronLeftIcon />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {tasks.length === 0 && (
      <p className="bg-white p-4 text-right text-[14px] text-[#8E929F]">אין מטלות ליחידה זו.</p>
    )}
  </div>
);

export default TasksTable;
