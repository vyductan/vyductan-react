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
import DrawerBasicDemo from "@acme/ui/components/drawer/examples/basic";
import DrawerFormDemo from "@acme/ui/components/drawer/examples/form";

export default function DrawerExamples() {
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
          <Badge variant="outline">Drawer</Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Drawer Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of the drawer component with different states and
          configurations.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of drawer.</CardDescription>
        </CardHeader>
        <CardContent>
          <DrawerBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Form in Drawer</CardTitle>
          <CardDescription>
            Use a form inside a drawer to create or edit a set of information.
            The footer submit button triggers form validation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DrawerFormDemo />
        </CardContent>
      </Card>
    </div>
  );
}
