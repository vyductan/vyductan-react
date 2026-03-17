import type React from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@acme/ui/components/tabs";

const App: React.FC = () => (
  <Tabs defaultValue="account" className="w-full">
    <TabsList>
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
      Make changes to your account here.
    </TabsContent>
    <TabsContent value="password">Change your password here.</TabsContent>
    <TabsContent value="settings">Manage your settings here.</TabsContent>
  </Tabs>
);

export default App;
