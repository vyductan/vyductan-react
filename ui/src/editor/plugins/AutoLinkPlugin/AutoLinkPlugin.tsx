import {
  createLinkMatcherWithRegExp,
  AutoLinkPlugin as LexicalAutoLinkPlugin,
} from "@lexical/react/LexicalAutoLinkPlugin";

const URL_REGEX =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => {
    return text;
  }),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => {
    return `mailto:${text}`;
  }),
];

export const AutoLinkPlugin = () => {
  return <LexicalAutoLinkPlugin matchers={MATCHERS} />;
};
