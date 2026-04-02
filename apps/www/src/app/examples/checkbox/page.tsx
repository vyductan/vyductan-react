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
import { Checkbox } from "@/components/ui/checkbox";
import CheckboxDemo from "@/components/ui/checkbox/examples/basic";
import CheckboxGroupDemo from "@/components/ui/checkbox/examples/group";
import { ArrowLeft } from "lucide-react";

export default function CheckboxExamples() {
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
          Checkbox Examples
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Interactive examples of checkbox components with different states and
          configurations.
        </p>
      </div>

      {/* Basic Usage */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of checkbox.</CardDescription>
        </CardHeader>
        <CardContent>
          <CheckboxDemo />
        </CardContent>
      </Card>

      {/* States Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Checkbox States</CardTitle>
          <CardDescription>
            Different states for various user interaction scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <h4 className="font-medium">Normal</h4>
              <div className="flex items-center space-x-2">
                <Checkbox id="normal" />
                <label htmlFor="normal" className="text-sm">
                  Normal state
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Checked</h4>
              <div className="flex items-center space-x-2">
                <Checkbox id="checked" defaultChecked />
                <label htmlFor="checked" className="text-sm">
                  Checked state
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Disabled</h4>
              <div className="flex items-center space-x-2">
                <Checkbox id="disabled" disabled />
                <label
                  htmlFor="disabled"
                  className="text-muted-foreground text-sm"
                >
                  Disabled state
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Group Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Checkbox Group</CardTitle>
          <CardDescription>Group of checkboxes.</CardDescription>
        </CardHeader>
        <CardContent>
          <CheckboxGroupDemo />
        </CardContent>
      </Card>
    </div>
  );
}
