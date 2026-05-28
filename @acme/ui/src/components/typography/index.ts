import {
  Typography as InternalTypography,
  Link,
  Paragraph,
  Text,
  Title,
  TypographyCurrency,
} from "./typography";

type CompoundedComponent = typeof InternalTypography & {
  Title: typeof Title;
  Text: typeof Text;
  Currency: typeof TypographyCurrency;
  Paragraph: typeof Paragraph;
  Link: typeof Link;
};

const Typography = InternalTypography as CompoundedComponent;
Typography.Title = Title;
Typography.Text = Text;
Typography.Currency = TypographyCurrency;
Typography.Paragraph = Paragraph;
Typography.Link = Link;

export { Typography };

export { TypographyCurrency } from "./typography";
