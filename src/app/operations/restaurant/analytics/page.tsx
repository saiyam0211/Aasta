"use client";

import OperationsLayout from "@/components/layouts/operations-layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Analytics() {
  return (
    <OperationsLayout type="restaurant">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#002a01]">Analytics</h1>
        <Card>
          <CardContent>
            <p className="text-center">No analytics data yet!</p>
          </CardContent>
        </Card>
      </div>
    </OperationsLayout>
  );
}
