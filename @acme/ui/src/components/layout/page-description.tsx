export type PageDescriptionProps = {
  subTitle?: React.ReactNode;
};

export const PageDescription = ({ subTitle }: PageDescriptionProps) => {
  if (!subTitle) {
    return null;
  }
  return (
    <p
      title={typeof subTitle === "string" ? subTitle : undefined}
      className="text-muted-foreground"
    >
      {subTitle}
    </p>
  );
};
