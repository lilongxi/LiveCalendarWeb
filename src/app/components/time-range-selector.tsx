'use client';

import React, { useState } from 'react';
import { addDays, format, startOfDay, isBefore, setHours, setMinutes, isSameDay, getHours, getMinutes, isEqual } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const TimeRangeSelector = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 6);

  const handlePrevDay = () => {
    setSelectedDate((prevDate) => {
      const newDate = addDays(prevDate, -1);
      return isBefore(newDate, today) ? prevDate : newDate;
    });
    setSelectedTime(null); // Reset time when changing day
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => {
      const newDate = addDays(prevDate, 1);
      return isBefore(newDate, maxDate) || isSameDay(newDate, maxDate) ? newDate : prevDate;
    });
    setSelectedTime(null); // Reset time when changing day
  };

  const renderTimeSlots = () => {
    const timeSlots = [];
    const now = new Date();
    const isToday = isSameDay(selectedDate, today);

     for (let hour = 7; hour <= 20; hour++) {
      const isSelectableHour = hour >= 9 && hour <= 17;

      const quarterHourSlots = [0, 15, 30, 45].map((minute) => {
        const time = setMinutes(setHours(startOfDay(selectedDate), hour), minute);
        const isPast = isToday && isBefore(time, now);
        const isSelected = selectedTime && isEqual(time, selectedTime);

        return (
          <TooltipProvider key={minute} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSelected ? 'default' : 'ghost'}
                  disabled={!isSelectableHour || isPast}
                  onClick={() => setSelectedTime(time)}
                  className={cn('w-full h-full', {
                    'bg-black text-white hover:bg-black/90': isSelected,
                    'bg-muted text-muted-foreground cursor-not-allowed': !isSelectableHour || isPast,
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

    return (
      <div className="grid grid-cols-4 gap-4">
        {timeSlots}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button onClick={handlePrevDay} disabled={isSameDay(selectedDate, today)} variant="outline">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className='text-center'>
            <p className="text-xl font-semibold">{format(selectedDate, 'yyyy-MM-dd')}</p>
            <p className="text-sm text-muted-foreground">
              {selectedTime ? `已选择: ${format(selectedTime, 'HH:mm')}` : '请选择一个时间'}
            </p>
          </div>
          <Button onClick={handleNextDay} disabled={isSameDay(selectedDate, maxDate)} variant="outline">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderTimeSlots()}
      </CardContent>
    </Card>
  );
};

export default TimeRangeSelector;