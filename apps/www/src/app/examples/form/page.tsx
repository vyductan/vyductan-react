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
import FormAntdDemo from "@/components/ui/form/examples/antd";
import FormBasicDemo from "@/components/ui/form/examples/basic";
import FormLayoutMultipleDemo from "@/components/ui/form/examples/layout-multiple";
import FormShadcnDemo from "@/components/ui/form/examples/shadcn";
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
          <Badge variant="outline">Form</Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Descriptions Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of descriptions components with different states
          and configurations.
        </p>
      </div>

      {/* Basic Usage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of descriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Layout Multiple</CardTitle>
          <CardDescription>Layout multiple usage of form.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormLayoutMultipleDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Antd</CardTitle>
          <CardDescription>Antd usage of form.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormAntdDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vertical</CardTitle>
          <CardDescription>Vertical usage of form.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormShadcnDemo />
        </CardContent>
      </Card>
    </div>
  );
}
