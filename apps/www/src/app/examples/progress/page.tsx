"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProgressCircleDemo from "@/components/ui/progress/demo/circle";
import ProgressInfoPositionDemo from "@/components/ui/progress/demo/info-position";
import ProgressLineDemo from "@/components/ui/progress/demo/line";
import ProgressSizeDemo from "@/components/ui/progress/demo/size";
import { ArrowLeft } from "lucide-react";

export default function DescriptionsExamples() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/examples">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Examples
            </Link>
          </Button>
          <Badge variant="outline">Progress</Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Progress Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of progress components with different states and
          configurations.
        </p>
      </div>

      {/* Basic Usage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressLineDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Circle</CardTitle>
          <CardDescription>Circle usage of progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressCircleDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Info Position</CardTitle>
          <CardDescription>Info position usage of progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressInfoPositionDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Size</CardTitle>
          <CardDescription>Size usage of progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressSizeDemo />
        </CardContent>
      </Card>
    </div>
  );
}
