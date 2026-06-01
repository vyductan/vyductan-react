"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@acme/ui/components/badge";
import { Button } from "@acme/ui/components/button";
import ButtonBasicDemo from "@acme/ui/components/button/examples/basic";
import ButtonColorVariantDemo from "@acme/ui/components/button/examples/color-variant";
import ButtonDangerDemo from "@acme/ui/components/button/examples/danger";
import ButtonDisabledDemo from "@acme/ui/components/button/examples/disabled";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";

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
          Button Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of button components with different states and
          configurations.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of button.</CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Color and Variant</CardTitle>
          <CardDescription>Color and variant usage of button.</CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonColorVariantDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Danger</CardTitle>
          <CardDescription>Danger usage of button.</CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonDangerDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Disabled</CardTitle>
          <CardDescription>Disabled usage of button.</CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonDisabledDemo />
        </CardContent>
      </Card>
    </div>
  );
}
