import React from 'react';
import type { EmployeeProfile } from 'shell/employeeStore';

interface Props {
  employee: EmployeeProfile;
}

const EmployeeAvatar: React.FC<Props> = ({ employee }) => (
  <div className="shrink-0">
    <img
      src={employee.image}
      alt={`${employee.firstName} ${employee.lastName}`}
      className="w-20 h-20 rounded-full object-cover border border-[#00033D]"
    />
  </div>
);

export default EmployeeAvatar;
