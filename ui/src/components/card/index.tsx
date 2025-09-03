import { CardMeta } from "./_components/card-meta";
import { Card as InternalCard } from "./card";

type InternalCardType = typeof InternalCard;
type CompoundedComponent = InternalCardType & {
  Meta: typeof CardMeta;
};

const Card = InternalCard as CompoundedComponent;

Card.Meta = CardMeta;

export { Card };
export * from "./_components";

export { type CardProps } from "./card";
