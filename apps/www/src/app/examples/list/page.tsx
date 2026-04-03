"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@acme/ui/components/badge";
import { Button } from "@acme/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";
import ListBasicDemo from "@acme/ui/components/list/examples/basic";
import ListSimpleDemo from "@acme/ui/components/list/examples/simple";
import ListVerticalDemo from "@acme/ui/components/list/examples/vertical";

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
          <CardTitle>Simple</CardTitle>
          <CardDescription>Simple usage of list.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListSimpleDemo />
        </CardContent>
      </Card>

      {/* Basic Usage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of list.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vertical</CardTitle>
          <CardDescription>Vertical usage of list.</CardDescription>
        </CardHeader>
        <CardContent>
          <ListVerticalDemo />
        </CardContent>
      </Card>
    </div>
  );
}
