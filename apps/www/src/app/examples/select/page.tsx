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
import SelectBasicDemo from "@/components/ui/select/demo/basic";
import SelectColorDemo from "@/components/ui/select/demo/color";
import SelectControlledValueDemo from "@/components/ui/select/demo/controlled-value";
import SelectMultipleDemo from "@/components/ui/select/demo/multiple";
import SelectOptionRenderDemo from "@/components/ui/select/demo/option-render";
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
          <Badge variant="outline">Form</Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Select Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of select components with different states and
          configurations.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of select.</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Controlled Value</CardTitle>
          <CardDescription>Controlled value usage of select.</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectControlledValueDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Multiple</CardTitle>
          <CardDescription>Multiple usage of select.</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectMultipleDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Color</CardTitle>
          <CardDescription>Color usage of select.</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectColorDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Custom Render</CardTitle>
          <CardDescription>Custom render usage of select.</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectOptionRenderDemo />
        </CardContent>
      </Card>
    </div>
  );
}
