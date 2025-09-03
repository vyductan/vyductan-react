## Basic

Basic drawer

```tsx
import { Drawer } from "@acme/ui/components/drawer";

function App() {
  const [open, setOpen] = useState(false);
  return (
    <Drawer
      title="Drawer"
      description="Drawer description"
      open={open}
      onOpenChange={setOpen}
    >
      <p>Drawer content</p>
    </Drawer>
  );
}
```
