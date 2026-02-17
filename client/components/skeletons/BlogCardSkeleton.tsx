import React from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

export default function BlogCardSkeleton() {
  return (
    <Card className="h-full" shadow="sm">
      <CardBody className="overflow-visible p-0">
        <Skeleton className="rounded-lg">
          <div className="h-[200px] w-full rounded-lg bg-default-300" />
        </Skeleton>
      </CardBody>
      <CardFooter className="flex-col items-start gap-2">
        <div className="flex justify-between w-full items-center">
          <Skeleton className="w-20 rounded-full">
            <div className="h-4 w-20 rounded-full bg-default-200" />
          </Skeleton>
          <Skeleton className="w-10 rounded-lg">
            <div className="h-4 w-10 rounded-lg bg-default-200" />
          </Skeleton>
        </div>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-6 w-4/5 rounded-lg bg-default-300" />
        </Skeleton>
        <Skeleton className="w-full rounded-lg">
          <div className="h-4 w-full rounded-lg bg-default-200" />
        </Skeleton>
        <Skeleton className="w-3/4 rounded-lg">
          <div className="h-4 w-3/4 rounded-lg bg-default-200" />
        </Skeleton>
        <Skeleton className="w-28 rounded-lg mt-2">
          <div className="h-4 w-28 rounded-lg bg-default-200" />
        </Skeleton>
      </CardFooter>
    </Card>
  );
}
