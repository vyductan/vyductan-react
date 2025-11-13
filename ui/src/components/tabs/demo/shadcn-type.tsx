"use client";

import type React from "react";
import { Space } from "@/components/ui/space";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const App: React.FC = () => (
  <Space direction="vertical" size="large" className="w-full">
    <div>
      <h3 className="mb-2 text-sm font-medium">Line (default)</h3>
      <Tabs defaultValue="tab1" type="line" className="w-full">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content of Tab 1</TabsContent>
        <TabsContent value="tab2">Content of Tab 2</TabsContent>
        <TabsContent value="tab3">Content of Tab 3</TabsContent>
      </Tabs>
    </div>

    <div>
      <h3 className="mb-2 text-sm font-medium">Card</h3>
      <Tabs defaultValue="tab1" type="card" className="w-full">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content of Tab 1</TabsContent>
        <TabsContent value="tab2">Content of Tab 2</TabsContent>
        <TabsContent value="tab3">Content of Tab 3</TabsContent>
      </Tabs>
    </div>

    <div>
      <h3 className="mb-2 text-sm font-medium">Solid</h3>
      <Tabs defaultValue="tab1" type="solid" className="w-full">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content of Tab 1</TabsContent>
        <TabsContent value="tab2">Content of Tab 2</TabsContent>
        <TabsContent value="tab3">Content of Tab 3</TabsContent>
      </Tabs>
    </div>
  </Space>
);

export default App;
