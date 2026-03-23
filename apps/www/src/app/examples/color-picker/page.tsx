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
import ColorPickerDemo from "@/components/ui/color-picker/demo/basic";
import { ArrowLeft } from "lucide-react";

export default function SelectExamples() {
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
          <Badge variant="outline">Color Picker</Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Color Picker Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of color picker components with different states
          and configurations.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of color picker.</CardDescription>
        </CardHeader>
        <CardContent>
          <ColorPickerDemo />
        </CardContent>
      </Card>
    </div>
  );
}
