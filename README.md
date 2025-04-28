# dashboard-react

## Colors

- Based on Tailwind CSS color palette
- Down 100 compare with Ant Design color palette

## Shadcn - v4

https://github.com/shadcn-ui/ui/tree/main/apps/v4

Mar 20, 2025, 4:02 PM GMT+7
<https://github.com/shadcn-ui/ui/commit/69fc8e23cc0631aac6b708ba0481509f1125d3d7>

## Antd

https://github.com/ant-design/ant-design

Apr 17, 2025, 2:35 PM GMT+7
<https://github.com/ant-design/ant-design/commit/f3bf6da30390f8e8ae791fbd29d7a8f6df07ba8f>

## Upgrade

### VSCode

```regex
(@acme/ui/)(?!components\b|shadcn\b|lib\b|icons\b|layout\b|src\b|\*|tailwind\b|theme\b)([^"]+)

$1components/$2
```
