import React from 'react';
import {
  Landmark,
  Stethoscope,
  Building2,
  Plane,
  Car,
  Compass,
  CalendarClock,
  FileCheck2,
  FileText,
  FileSearch,
  RefreshCw,
  Briefcase,
  HelpCircle
} from 'lucide-react';

interface ServiceIconProps {
  name: string;
  className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'Landmark':
      return <Landmark className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'Plane':
      return <Plane className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'CalendarClock':
      return <CalendarClock className={className} />;
    case 'FileCheck2':
      return <FileCheck2 className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'FileSearch':
      return <FileSearch className={className} />;
    case 'RefreshCw':
      return <RefreshCw className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
