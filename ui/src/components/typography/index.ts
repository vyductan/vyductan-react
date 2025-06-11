import {
  Typography as InternalTypography,
  Link,
  Paragraph,
  Text,
  Title,
} from "./typography";

type CompoundedComponent = typeof InternalTypography & {
  Title: typeof Title;
  Text: typeof Text;
  Paragraph: typeof Paragraph;
  Link: typeof Link;
};

const Typography = InternalTypography as CompoundedComponent;
Typography.Title = Title;
Typography.Text = Text;
Typography.Paragraph = Paragraph;
Typography.Link = Link;

export { Typography };
