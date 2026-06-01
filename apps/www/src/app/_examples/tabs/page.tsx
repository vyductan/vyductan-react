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
import TabsBasicDemo from "@acme/ui/components/tabs/examples/basic";
import ShadcnDemo from "@acme/ui/components/tabs/examples/shadcn";
import ShadcnTypeDemo from "@acme/ui/components/tabs/examples/shadcn-type";
import TypeDemo from "@acme/ui/components/tabs/examples/type";

export default function TabsExamples() {
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
          <Badge variant="outline">Navigation</Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Tabs Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of tabs components with different states and
          configurations.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of tabs.</CardDescription>
        </CardHeader>
        <CardContent>
          <TabsBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Type</CardTitle>
          <CardDescription>
            Tabs supports different type styles: line (default), card, and
            solid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TypeDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Shadcn Pattern</CardTitle>
          <CardDescription>
            Tabs can also be used with the Shadcn UI pattern using TabsList,
            TabsTrigger, and TabsContent components as children.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShadcnDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Shadcn Pattern with Type</CardTitle>
          <CardDescription>
            Shadcn pattern also supports different type styles. The type prop is
            passed to the root Tabs component and automatically propagated to
            child components via context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShadcnTypeDemo />
        </CardContent>
      </Card>
    </div>
  );
}
