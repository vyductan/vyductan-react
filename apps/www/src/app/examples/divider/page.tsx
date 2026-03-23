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
import DividerHorizontalDemo from "@/components/ui/divider/demo/horizontal";
import DividerPlainDemo from "@/components/ui/divider/demo/plain";
import DividerSizeDemo from "@/components/ui/divider/demo/size";
import DividerVerticalDemo from "@/components/ui/divider/demo/vertital";
import { ArrowLeft } from "lucide-react";

export default function EmptyExamples() {
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
          <Badge variant="outline">Form</Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          List Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of list components with different states and
          configurations.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Horizontal</CardTitle>
          <CardDescription>Horizontal usage of divider.</CardDescription>
        </CardHeader>
        <CardContent>
          <DividerHorizontalDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vertical</CardTitle>
          <CardDescription>Vertical usage of divider.</CardDescription>
        </CardHeader>
        <CardContent>
          <DividerVerticalDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Size</CardTitle>
          <CardDescription>Size usage of divider.</CardDescription>
        </CardHeader>
        <CardContent>
          <DividerSizeDemo />
        </CardContent>
      </Card>

      {/* Basic Usage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Plain</CardTitle>
          <CardDescription>Plain usage of divider.</CardDescription>
        </CardHeader>
        <CardContent>
          <DividerPlainDemo />
        </CardContent>
      </Card>
    </div>
  );
}
