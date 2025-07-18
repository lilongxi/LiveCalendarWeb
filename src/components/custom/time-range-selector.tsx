'use client';

import React, { useState, useEffect } from 'react';
import { addDays, format, startOfDay, isBefore, setHours, setMinutes, isSameDay, isEqual } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface SelectedTime {
  time: Date;
  isActive: boolean;
  isAppointment: boolean;
  id: string
}

interface TimeRangeSelectorProps {
  partnerId?: string;
  selectedTimes?: SelectedTime[];
  onTimeSelect?: (selection: SelectedTime) => void;
  availableTimes?: SelectedTime[];
  managementMode?: boolean;
  disabled?: boolean;
}

const TimeRangeSelector = ({ 
  selectedTimes = [], 
  onTimeSelect = () => {},
  availableTimes,
  managementMode = false,
  disabled = false
}: TimeRangeSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeToConfirm, setTimeToConfirm] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 6);

  const handlePrevDay = () => {
    setSelectedDate((prevDate) => {
      const newDate = addDays(prevDate, -1);
      return isBefore(newDate, today) ? prevDate : newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => {
      const newDate = addDays(prevDate, 1);
      return isBefore(newDate, maxDate) || isSameDay(newDate, maxDate) ? newDate : prevDate;
    });
  };

  const handleTimeClick = (time: Date) => {
    const existingSelection = selectedTimes.find(st => isEqual(st.time, time));
    if (existingSelection) {
      onTimeSelect(existingSelection);
    } else {
      setTimeToConfirm(time);
      setDialogOpen(true);
    }
  };

  const handleConfirm = () => {
    const existingSelection = availableTimes?.find(st => isEqual(st.time, timeToConfirm!));
    if (existingSelection) {
      onTimeSelect(existingSelection)
    } else if (timeToConfirm) {
      onTimeSelect({ time: timeToConfirm, isActive: true, id: '', isAppointment: false });
    }
    setDialogOpen(false);
  };

  const renderTimeSlots = () => {
    if (!isClient) {
      return <div>Loading...</div>; // Or a placeholder
    }
    const timeSlots = [];
    const now = new Date();
    const isToday = isSameDay(selectedDate, today);

    for (let hour = 7; hour <= 20; hour++) {
      const isSelectableHour = hour >= 9 && hour <= 17;

      const quarterHourSlots = [0, 15, 30, 45].map((minute) => {
        const time = setMinutes(setHours(startOfDay(selectedDate), hour), minute);
        const isPast = isToday && isBefore(time, now);
        const selection = selectedTimes.find(selectedTime => isEqual(time, selectedTime.time));
        const isSelectedActive = selection?.isActive === true;
        const isSelectedInactive = selection?.isActive === false;
        const isAppointed = selection?.isAppointment === true;

        const isAvailable = availableTimes ? availableTimes.some(item => isEqual(time, item.time)) : true;

        let isDisabled = disabled || !isSelectableHour || isPast || isAppointed;
        if (availableTimes) {
          isDisabled = isDisabled || !isAvailable;
        }

        if (!managementMode) {
          isDisabled = isDisabled || isSelectedInactive;
        }

        return (
          <TooltipProvider key={minute} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSelectedActive ? 'default' : 'ghost'}
                  data-slot={selection?.id}
                  disabled={isDisabled}
                  onClick={() => handleTimeClick(time)}
                  className={cn('w-full h-full', {
                    'bg-black text-white hover:bg-black/90': isSelectedActive,
                    'bg-yellow-500 text-white cursor-not-allowed hover:bg-yellow-500/90': isAppointed,
                    'bg-red-500 text-white cursor-not-allowed hover:bg-red-500/90': isSelectedInactive && !managementMode,
                    'bg-red-500 text-white hover:bg-red-500/90': isSelectedInactive && managementMode,
                    'bg-muted text-muted-foreground cursor-not-allowed': !isSelectableHour || isPast || (availableTimes && !isAvailable) || disabled,
                  })}
                >
                  {format(time, 'mm')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{format(time, 'HH:mm')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      });

      timeSlots.push(
        <Card key={hour} className="text-center">
          <CardHeader className="p-2 border-b">
            <CardTitle className="text-base font-medium">{format(setHours(new Date(), hour), 'HH:00')}</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-2">
              {quarterHourSlots}
            </div>
          </CardContent>
        </Card>
      );
    }

    return <div className="grid grid-cols-4 gap-4">{timeSlots}</div>;
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button onClick={handlePrevDay} disabled={isSameDay(selectedDate, today) || disabled} variant="outline">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className='text-center'>
              <p className="text-xl font-semibold">{format(selectedDate, 'yyyy-MM-dd')}</p>
              <p className="text-sm text-muted-foreground">请选择一个时间</p>
            </div>
            <Button onClick={handleNextDay} disabled={isSameDay(selectedDate, maxDate) || disabled} variant="outline">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderTimeSlots()}</CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认选择</DialogTitle>
            <DialogDescription>
              您确定要选择 {timeToConfirm ? format(timeToConfirm, 'yyyy-MM-dd HH:mm') : ''} 吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleConfirm}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeRangeSelector;