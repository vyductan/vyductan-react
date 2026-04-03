P0 — verify trước

@acme/ui/src/components/select/\_components/index.tsx

- SelectTrigger vẫn nhận size như wrapper đang map (small -> sm, large -> lg, default)
- Selector \*:data-[slot=select-value] vẫn còn hiệu lực
- Logic ẩn icon bằng [&>svg:last-of-type] vẫn đúng với DOM mới của shadcn
- allowClear hoạt động đúng
- loading không đè sai icon/layout
- suffixIcon không bị double icon
- disabled + allowClear không hiện clear icon sai

Đối chiếu với:

- @acme/ui/src/shadcn/select.tsx

---

@acme/ui/src/shadcn/select.tsx

- SelectValue vẫn có data-slot="select-value"
- SelectTrigger vẫn render icon ở cuối trigger
- data-size contract vẫn đúng với wrapper
- DOM structure không phá selector đang dùng ở wrapper

---

@acme/ui/src/components/tabs/\_components.tsx

- TabsList vẫn truyền được variant="line" | "default"
- mode line render underline đúng
- mode card render background/active state đúng
- group-data-[orientation=horizontal]/tabs vẫn hoạt động
- data-[state=active] vẫn đúng với styling hiện tại

Đối chiếu với:

- @acme/ui/src/shadcn/tabs.tsx

---

@acme/ui/src/shadcn/tabs.tsx

- TabsList vẫn support variant
- data-slot="tabs-list", data-slot="tabs-trigger" vẫn giữ nguyên
- data-variant vẫn được set trên list
- data-active/state classes vẫn tương thích với wrapper
- orientation classes không đổi contract

---

@acme/ui/src/components/form/\_components/form-control.tsx

- useFormField() vẫn trả error đúng
- ShadFormControl vẫn nhận className + child slot như cũ
- logic child.type === DatePicker/TimePicker/Select/AutoComplete còn đúng
- các control trên vẫn nhận w-full như mong muốn
- aria/error state không bị mất

Đối chiếu với:

- @acme/ui/src/shadcn/form.tsx

---

@acme/ui/src/shadcn/form.tsx

- FormControl vẫn là slot-based wrapper
- data-slot="form-control" vẫn còn
- aria-describedby / aria-invalid contract không đổi
- useFormField() không đổi shape của return object

---

@acme/ui/src/components/drawer/\_components.tsx

- DrawerContent custom vẫn mở đúng ở top/right/bottom/left
- data-[vaul-drawer-direction=...] selectors vẫn khớp
- Sonner click guard trong onInteractOutside vẫn hoạt động
- header/footer custom không lệch layout
- kiểm tra class touch-auto! select-text! có thực sự áp dụng hay cần sửa thành cú pháp Tailwind hợp lệ

Đối chiếu với:

- @acme/ui/src/shadcn/drawer.tsx

---

@acme/ui/src/shadcn/drawer.tsx

- data-slot="drawer-content" / drawer-portal / drawer-overlay vẫn ổn
- Vaul direction attrs vẫn giữ nguyên
- width/max-width cho left/right vẫn tương thích wrapper custom
- không có thay đổi DOM khiến custom wrapper lệch

---

P1 — smoke test kỹ

@acme/ui/src/components/modal/\_components.tsx

- onInteractOutside vẫn nhận event đúng kiểu
- click vào Sonner toast không đóng dialog
- callback onInteractOutside gốc vẫn được gọi

Đối chiếu với:

- @acme/ui/src/shadcn/dialog.tsx

---

@acme/ui/src/shadcn/dialog.tsx

- DialogContent vẫn pass-through onInteractOutside
- showCloseButton vẫn render đúng
- close button không conflict với wrapper modal

---

@acme/ui/src/components/dropdown/\_components.tsx

- variant="destructive" vẫn hoạt động
- icon color selector vẫn đúng
- text/icon màu destructive không bị regression

Đối chiếu với:

- @acme/ui/src/shadcn/dropdown-menu.tsx

---

@acme/ui/src/shadcn/dropdown-menu.tsx

- DropdownMenuItem vẫn có variant + data-variant
- destructive classes vẫn bám đúng attr
- inset vẫn không đổi contract

---

@acme/ui/src/components/sidebar/\_component.tsx

- SidebarMenuButton vẫn nhận className patch đúng
- icon trong menu button vẫn giữ size mong muốn
- asChild path vẫn không làm mất styling

Đối chiếu với:

- @acme/ui/src/shadcn/sidebar.tsx

---

@acme/ui/src/shadcn/sidebar.tsx

- SidebarMenuButton vẫn set data-slot="sidebar-menu-button"
- selector [&_svg]/[&>span:last-child] không đổi theo hướng phá wrapper
- asChild, tooltip, size, variant vẫn ổn

---

@acme/ui/src/components/calendar/\_components.tsx

- CustomCalendarDayButton vẫn nhận modifiers
- custom data-range-start/end/middle vẫn lên đúng
- override Weeks component vẫn còn tương thích
- range style không bị conflict với class mới trong shadcn calendar

Đối chiếu với:

- @acme/ui/src/shadcn/calendar.tsx

---

@acme/ui/src/shadcn/calendar.tsx

- CalendarDayButton prop shape không đổi
- components.DayButton / components.Weeks override vẫn support
- selected/range classes không đè mất custom behavior từ wrapper

---

@acme/ui/src/components/table/\_components/base.tsx

- primitive Table\* exports vẫn còn đủ
- TableCaption re-export vẫn hợp lệ
- sticky header vẫn không conflict với wrapper container mới
- border/padding override vẫn render đúng

Đối chiếu với:

- @acme/ui/src/shadcn/table.tsx

---

@acme/ui/src/shadcn/table.tsx

- Table, TableHead, TableCell, TableCaption exports không đổi
- data-slot names không đổi nếu có code khác đang target
- container/table structure không ảnh hưởng sticky/bordered wrapper

---

P2 — verify nhanh

@acme/ui/src/components/button/index.tsx

- mapping size từ shadcn sang API local vẫn đúng:
  - xs, sm, lg, icon, icon-xs, icon-sm, icon-lg, default
- mapping variant vẫn đúng:
  - outline, destructive, secondary, ghost, default
- không có variant/size mới ở shadcn bị bỏ sót

Đối chiếu với:

- @acme/ui/src/shadcn/button.tsx

---

@acme/ui/src/shadcn/button.tsx

- danh sách variant không đổi ngoài dự kiến
- danh sách size không đổi ngoài dự kiến
- asChild behavior vẫn đúng
- data-size, data-variant vẫn đúng cho các wrapper đang dựa vào

---

Gợi ý thứ tự verify thực tế

1. select
2. tabs
3. form-control
4. drawer
5. modal
6. dropdown
7. sidebar
8. calendar
9. table
10. button
