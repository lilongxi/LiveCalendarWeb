'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Page() {
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
              <Input id="name" placeholder="合伙人的名字" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className='w-full'>创建</Button>
        </CardFooter>
      </Card>
    </div>
  );
}