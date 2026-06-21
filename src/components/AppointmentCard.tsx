import { Calendar, MapPin, Syringe } from 'lucide-react';
import type { Appointment } from '@/types';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const { projectName, bodyPart, anesthesiaLabel, appointmentTime, doctor } = appointment;

  return (
    <div className="w-full max-w-[640px] bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-50 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-sky-50"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-3 border-white flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1.5">
              <h3 className="text-2xl font-bold text-gray-800 truncate">{doctor.name}</h3>
              <span className="text-sm text-sky-600 font-medium shrink-0">医生</span>
            </div>
            <p className="text-gray-500 text-base mb-2.5 truncate">{doctor.title}</p>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-sky-500 shrink-0" strokeWidth={2} />
              <span className="text-base font-medium">{appointmentTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-7">
        <h2 className="text-3xl font-bold text-gray-800 mb-5 leading-tight">{projectName}</h2>
        <div className="flex flex-wrap gap-3">
          <div className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-sky-50 text-sky-700 border border-sky-100'
          )}>
            <MapPin className="w-4.5 h-4.5" strokeWidth={2.2} />
            <span className="text-sm font-medium">{bodyPart}</span>
          </div>
          <div className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full',
            'bg-violet-50 text-violet-700 border border-violet-100'
          )}>
            <Syringe className="w-4.5 h-4.5" strokeWidth={2.2} />
            <span className="text-sm font-medium">{anesthesiaLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
