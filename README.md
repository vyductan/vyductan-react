# Custom React Components: Shadcn + AntD Style

A modern UI component set built with [Shadcn UI](https://ui.shadcn.com/) and [Tailwind CSS], exposing an API similar to [Ant Design](https://ant.design/) for ease of use and consistency.

- 🌀 Styled with Tailwind CSS and Shadcn components
- ⚙️ Compatible props with AntD components
- 🧩 Reusable & customizable
- 🧠 Some internal logic adapted from AntD

Ideal for teams transitioning from AntD or looking for AntD-like usage with a modern Tailwind-based design system.

## Colors

- Based on Tailwind CSS color palette
- Down 100 compare with Ant Design color palette

## Shadcn - v4

https://github.com/shadcn-ui/ui

May 31, 2025, 5:42 PM GMT+7
<https://github.com/shadcn-ui/ui/commit/9cbc6641d91901600b553a63ae5a9ce9ccb5105a>

## Antd

https://github.com/ant-design/ant-design

Apr 17, 2025, 2:35 PM GMT+7
<https://github.com/ant-design/ant-design/commit/f3bf6da30390f8e8ae791fbd29d7a8f6df07ba8f>

## Upgrade

### VSCode

```regex
(@acme/ui/)(?!components\b|shadcn\b|lib\b|icons\b|layout\b|src\b|\*|tailwind\b|theme\b|link\b)([^"]+)

$1components/$2
```

## Fix

### 2026-03-27

- [ ] Checkbox -> background in storybook
- [ ] Storybook -> [WARNING] The 'ariaLabel' prop on 'PopoverProvider...p://localhost:6006/sb-manager/globals-runtime.js:5810

## Temp Checkbox

Có — nên refactor nhẹ, nhưng không nên dồn card styling vào Checkbox primitive nhiều hơn nữa.

Kết luận ngắn:

Checkbox variant="card" hợp lý cho single checkbox với rich label/content ở checkbox.tsx:144-198.
Nhưng với grouped options, best practice là để group/item wrapper chịu trách nhiệm layout/card/list presentation, còn checkbox primitive chỉ giữ:
state/semantics
checked/indeterminate UI
accessibility/keyboard/form behavior
Đó cũng là hướng mà:

code hiện tại đang đi trong checkbox-group.tsx:116-134
shadcn docs/example và Radix composition đều nghiêng về:
primitive = control
wrapper/field/list item = card structure
Mình thấy gì ở implementation hiện tại

1. Checkbox primitive đang tự có variant="card"
   Ở checkbox.tsx:152-183, bản thân Checkbox render luôn <label> như một card khi variant="card".

Điều này ổn cho story kiểu:

checkbox.stories.tsx:81-94
Tức là use case:

một checkbox độc lập
label nhiều dòng
cả khối click được 2. CheckboxGroup hiện đang không reuse variant="card"
Ở checkbox-group.tsx:86-109, group vẫn render Checkbox default, rồi bọc ngoài bằng wrapper card ở checkbox-group.tsx:116-134.

Cách này thực ra đúng hướng hơn về mặt composition:

group item wrapper quản lý:
card surface
selected state surface
focus ring
disabled look
checkbox primitive chỉ là control con bên trong 3. Nhưng API hiện tại hơi split-brain
Hiện có 2 khái niệm gần nhau:

Checkbox variant="card"
CheckboxGroup optionVariant="card"
Nên cảm giác hơi duplicated về mặt API/mental model.

Best practice / approach
Cái nên giữ
Giữ nguyên nguyên tắc:

Single option rich checkbox → Checkbox variant="card"
List/grid of selectable options → CheckboxGroup optionVariant="card"
Vì 2 case này khác nhau về ownership:

single checkbox: primitive có thể own wrapper luôn
group checkbox: container item nên own wrapper để xử lý:
grid/list layout
selected state per item
focus-within ring
disabled state toàn item
item-level hooks/data attrs
Cái nên refactor
Refactor về internal styling ownership, không nhất thiết đổi public API lớn.

Cụ thể:

Tránh duplicate card surface rules giữa Checkbox và CheckboxGroup

Hiện Checkbox có card classes riêng
CheckboxGroup cũng có card wrapper classes riêng
Nên tách ra 1 shared styling helper/const cho “card option surface semantics”
Để CheckboxGroup tiếp tục own card wrapper

Không nên đổi group sang kiểu:
Checkbox variant="card" bên trong group
rồi lại wrap thêm card bên ngoài
Vì dễ thành nested-card / double styling / ownership lẫn lộn
Nếu muốn API nhất quán hơn, có thể cân nhắc đổi tên sau này:

CheckboxGroup optionVariant="card" → variant="card"
nhưng đây là API change, không bắt buộc ngay
Recommendation thực tế
Mình recommend:
Không refactor behavior lớn. Chỉ refactor structure nhẹ.

Nên làm
Giữ:
Checkbox variant="card"
CheckboxGroup optionVariant="card"
Dọn internal để:
Checkbox card styles = dành cho standalone card checkbox
CheckboxGroup card item styles = dành cho group option cards
Nếu muốn giảm duplication:
extract shared class tokens / helper function cho selected/disabled/focus/card surface
Không nên làm
Không ép CheckboxGroup reuse trực tiếp Checkbox variant="card" cho từng item
Không để primitive checkbox gánh luôn trách nhiệm list-item/card-wrapper trong grouped context
Vì sao
Về UX/accessibility/composition, group item card là một “field row / selectable tile”, không chỉ là bản thân checkbox control. Wrapper ngoài là nơi hợp lý để gắn:

focus-within
selected surface
disabled whole-tile styling
item-level test hooks như:
checkbox-group.test.tsx:64-66
checkbox-group.test.tsx:76-89
Bottom line
Có refactor nhẹ thì tốt. Nhưng hướng đúng là:

đừng đẩy thêm responsibility vào Checkbox
giữ card layout của group ở CheckboxGroup
refactor để giảm duplicate styling/token thôi
Nếu muốn, bước tiếp theo mình có thể:

chỉ ra exact refactor shape nên làm trong 2 file, hoặc
implement luôn bản refactor tối thiểu đó.
