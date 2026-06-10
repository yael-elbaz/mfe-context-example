import React from 'react';
import type { EmployeeProfile } from 'shell/employeeStore';

interface Props {
  employee: EmployeeProfile;
}

const EmployeeIdentity: React.FC<Props> = ({ employee }) => (
  <div className="flex items-center gap-[10px] shrink-0">
    <img
      src={employee.image}
      alt={`${employee.firstName} ${employee.lastName}`}
      className="w-8 h-8 rounded-full object-cover"
    />
    <div className="leading-[1.25]">
      <div className="font-semibold text-sm text-[#1E3BA2]">
        {employee.firstName} {employee.lastName}
      </div>
      <div className="text-[11px] text-[#848282]">
        {employee.role} · {employee.department} · מס׳ {employee.id}
      </div>
    </div>
  </div>
);

export default EmployeeIdentity;
