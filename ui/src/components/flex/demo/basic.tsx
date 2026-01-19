import { Button } from "@acme/ui/components/button";
import { Flex } from "@acme/ui/components/flex";

export function FlexBasicDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Basic Flex Layout</h3>
        <Flex className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Button variant="outline">Item 1</Button>
          <Button variant="outline">Item 2</Button>
          <Button variant="outline">Item 3</Button>
        </Flex>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Vertical Direction</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">
              Using direction="column"
            </p>
            <Flex
              direction="column"
              gap={8}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <Button variant="outline">Item 1</Button>
              <Button variant="outline">Item 2</Button>
              <Button variant="outline">Item 3</Button>
            </Flex>
          </div>
          <div>
            <p className="mb-2 text-sm text-gray-600">Using vertical prop</p>
            <Flex
              vertical
              gap={8}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <Button variant="outline">Item 1</Button>
              <Button variant="outline">Item 2</Button>
              <Button variant="outline">Item 3</Button>
            </Flex>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Justify Content</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">justify="between"</p>
            <Flex
              justify="between"
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <Button variant="outline">Start</Button>
              <Button variant="outline">End</Button>
            </Flex>
          </div>
          <div>
            <p className="mb-2 text-sm text-gray-600">justify="center"</p>
            <Flex
              justify="center"
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <Button variant="outline">Center</Button>
            </Flex>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Align Items</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">align="center"</p>
            <Flex
              align="center"
              className="h-20 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <Button variant="outline">Centered</Button>
            </Flex>
          </div>
          <div>
            <p className="mb-2 text-sm text-gray-600">align="end"</p>
            <Flex
              align="end"
              className="h-20 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <Button variant="outline">Bottom Aligned</Button>
            </Flex>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Wrap</h3>
        <Flex
          wrap="wrap"
          gap={8}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <Button variant="outline">Item 1</Button>
          <Button variant="outline">Item 2</Button>
          <Button variant="outline">Item 3</Button>
          <Button variant="outline">Item 4</Button>
          <Button variant="outline">Item 5</Button>
          <Button variant="outline">Item 6</Button>
        </Flex>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Gap</h3>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">gap={16}</p>
            <Flex
              gap={16}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <Button variant="outline">Item 1</Button>
              <Button variant="outline">Item 2</Button>
              <Button variant="outline">Item 3</Button>
            </Flex>
          </div>
          <div>
            <p className="mb-2 text-sm text-gray-600">gap="1rem"</p>
            <Flex
              gap="1rem"
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <Button variant="outline">Item 1</Button>
              <Button variant="outline">Item 2</Button>
              <Button variant="outline">Item 3</Button>
            </Flex>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Inline Flex</h3>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <span>Before </span>
          <Flex inline gap={8}>
            <Button variant="outlined" size="small">
              Inline
            </Button>
            <Button variant="outlined" size="small">
              Flex
            </Button>
          </Flex>
          <span> After</span>
        </div>
      </div>
    </div>
  );
}
