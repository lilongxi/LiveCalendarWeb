'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TimeRangeSelector, { SelectedTime } from '@/components/custom/time-range-selector';
import { api } from '@/utils/api';
import { isEqual } from 'date-fns';

function FounderPageContent() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get('id');
  const [availableSlots, setAvailableSlots] = useState<SelectedTime[]>([]);
  const [partnerName, setPartnerName] = useState('');

  useEffect(() => {
    if (shareId) {
      api.get(`http://localhost:3306/api/partners/share_link/${shareId}`).then((res: any) => {
        if (res?.data) {
          setPartnerName(res.data.partner_name || '');
          const available = res.data.available_slots.map((t: any) => ({ ...t, time: new Date(t.start_time) }));
          setAvailableSlots(available);
        }
      }).catch(err => {
        console.error("Failed to fetch schedule", err);
        alert("无法加载预约信息，请检查链接是否正确。");
      });
    }
  }, [shareId]);

  const handleAppointmentSelect = async (selection: SelectedTime) => {

    if (selection.isAppointment) return;

    const founderName = prompt("请输入您的名字:");
    if (!founderName) {
        alert("名字不能为空");
        return;
    }
    try {
      const res = await api.post('http://localhost:3306/api/appointments/create', {
        slot_id: selection.id, // We need the slot id to book
        founder_name: founderName,
      });

      console.log(res)

      // setAvailableSlots(prev => prev.filter(item => !isEqual(item.time, selection.time)));

      // alert('预约成功!');
    } catch (error) {
      console.error('预约失败:', error);
      alert('预约失败，该时间可能已被预约。');
    }
  };

  if (!shareId) {
    return <div>无效的分享链接</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">为 {partnerName} 预约时间</h1>
      <p className="mb-8">请选择一个可用的时间段进行预约。</p>
      <TimeRangeSelector
        onTimeSelect={handleAppointmentSelect}
        availableTimes={availableSlots}
      />
    </div>
  );
}

export default function FounderPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FounderPageContent />
    </Suspense>
  );
}