'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/utils/api'; // 假设 api.ts 在 src/lib/ 目录下

export default function Page() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleCreatePartner = async () => {
    if (!name.trim()) {
      alert('请输入合伙人名字');
      return;
    }
    try {
      const newPartner: any = await api.post('http://localhost:3306/api/partners/create', { name });
      router.push('/partners?id=' + newPartner?.data?.id?.toString());
    } catch (error) {
      console.error('创建失败:', error);
      alert('创建失败，请查看控制台获取更多信息。');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>创建合伙人</CardTitle>
          <CardDescription>输入合伙人的名字以创建。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">名字</Label>
              <Input
                id="name"
                placeholder="合伙人的名字"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className='w-full' onClick={handleCreatePartner}>创建</Button>
        </CardFooter>
      </Card>
    </div>
  );
}