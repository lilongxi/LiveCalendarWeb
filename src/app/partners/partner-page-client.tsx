'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TimeRangeSelector, { SelectedTime } from '@/components/custom/time-range-selector';
import { api } from '@/utils/api';

function PartnerPageContent() {
  const searchParams = useSearchParams();
  const partnerId = searchParams.get('id');
  const [selectedTimes, setSelectedTimes] = useState<SelectedTime[]>([]);

  useEffect(() => {
    if (partnerId) {
      api.get(`http://localhost:3306/api/slots/all?partner_id=${partnerId}`).then((res: any) => {
        if (res?.data) {
          setSelectedTimes(res.data.map((t: any) => ({ time: new Date(t.start_time), isActive: t.is_active, id: t.id, isAppointment: t.is_appointment })));
        }
      });
    }
  }, [partnerId]);

  const handleTimeSelect = async (selection: SelectedTime) => {
    if (!partnerId) {
      alert('Partner ID not found in URL');
      return;
    }
    const { id, time } = selection

    if (id) {
      try {
        await api.get('http://localhost:3306/api/slots/delete/' + id);
        setSelectedTimes(prevTimes =>
          prevTimes.map(st =>
            st.time.getTime() === time.getTime() ? { ...st, isActive: false } : st
          )
        );
        alert('时间段已取消!');
      } catch (error) {
        console.error('取消失败:', error);
        alert('取消失败，请查看控制台获取更多信息。');
      }
    } else {
      try {
        const newSolts: any = await api.post('http://localhost:3306/api/slots/create', {
          partner_id: partnerId,
          start_time: time.toISOString(),
        });
        const existing = selectedTimes.find(st => st.time.getTime() === time.getTime());
        if (existing) {
            setSelectedTimes(prevTimes =>
                prevTimes.map(st =>
                  st.time.getTime() === time.getTime() ? { ...st, isActive: true } : st
                )
              );
        } else {
            setSelectedTimes(prevTimes => [...prevTimes, { time, isActive: true, id: newSolts?.data?.id, isAppointment: false }]);
        }
        alert('时间段预定成功!');
      } catch (error) {
        console.error('预定失败:', error);
        alert('预定失败，请查看控制台获取更多信息。');
      }
    }
  };

  if (!partnerId) {
    return <div>Loading or Partner ID not found...</div>;
  }

  return (
    <div>
      <h1>为合伙人预定时间 (ID: {partnerId})</h1>
      <TimeRangeSelector
        partnerId={partnerId}
        selectedTimes={selectedTimes}
        onTimeSelect={handleTimeSelect}
      />
    </div>
  );
}

export default function PartnerPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnerPageContent />
    </Suspense>
  );
}