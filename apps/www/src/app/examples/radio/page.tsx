"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/components/card";
import { PageContainer } from "@acme/ui/components/layout";
import RadioBasicDemo from "@acme/ui/components/radio/examples/basic";
import RadioButtonStyleDemo from "@acme/ui/components/radio/examples/button-style";
import RadioCardDemo from "@acme/ui/components/radio/examples/card";
import RadioCardComposableDemo from "@acme/ui/components/radio/examples/card-composable";
import RadioColorDemo from "@acme/ui/components/radio/examples/color";
import RadioDisabledDemo from "@acme/ui/components/radio/examples/disabled";
import RadioPillDemo from "@acme/ui/components/radio/examples/pill";
import RadioTagDemo from "@acme/ui/components/radio/examples/tag";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@acme/ui/components/tabs";

// Composes the demos directly instead of rendering radio.mdx: that file is
// attached to the Storybook stories tree via `<Meta of>`, so it cannot also be
// a Next page module.
export default function RadioExamples() {
  return (
    <PageContainer header={{ title: "Radio Examples" }}>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Basic</CardTitle>
          <CardDescription>Basic usage of radio.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioBasicDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Disabled</CardTitle>
          <CardDescription>Radio unavailable state.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioDisabledDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Button style</CardTitle>
          <CardDescription>Radio group rendered as buttons.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioButtonStyleDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pill</CardTitle>
          <CardDescription>Pill-shaped radio group.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioPillDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tag</CardTitle>
          <CardDescription>Tag-styled radio group.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioTagDemo />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Color</CardTitle>
          <CardDescription>Radio color options.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioColorDemo />
        </CardContent>
      </Card>

      {/* Mirrors radio/examples/card.mdx: the two APIs sit in per-example tabs
          so the standard and composable variants can be compared in place. */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Card variant</CardTitle>
          <CardDescription>
            Compare the standard and composable APIs for richer label content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standard-api" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="standard-api">Standard API</TabsTrigger>
              <TabsTrigger value="composable-api">Composable API</TabsTrigger>
            </TabsList>
            <TabsContent
              value="standard-api"
              forceMount
              className="data-[state=inactive]:hidden"
            >
              <RadioCardDemo />
            </TabsContent>
            <TabsContent
              value="composable-api"
              forceMount
              className="data-[state=inactive]:hidden"
            >
              <RadioCardComposableDemo />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
