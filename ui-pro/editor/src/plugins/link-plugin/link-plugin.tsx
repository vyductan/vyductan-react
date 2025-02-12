import { LinkPlugin as LexicalLinkPlugin } from "@lexical/react/LexicalLinkPlugin";

const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\w$&+,:;=-]+@)?[\d.A-Za-z-]+|(?:www.|[\w$&+,:;=-]+@)[\d.A-Za-z-]+)((?:\/[%+./~\w-_]*)?\??[\w%&+.;=@-]*#?\w*)?)/,
);
export function validateUrl(url: string): boolean {
  return url === "https://" || urlRegExp.test(url);
}

export const LinkPlugin = () => {
  return <LexicalLinkPlugin validateUrl={validateUrl} />;
};
