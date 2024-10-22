import {
  createLinkMatcherWithRegExp,
  AutoLinkPlugin as LexicalAutoLinkPlugin,
} from "@lexical/react/LexicalAutoLinkPlugin";

const URL_REGEX =
  /(https?:\/\/(?:www\.|(?!www))[\dA-Za-z][\dA-Za-z-]+[\dA-Za-z]\.\S{2,}|www\.[\dA-Za-z][\dA-Za-z-]+[\dA-Za-z]\.\S{2,}|https?:\/\/(?:www\.|(?!www))[\dA-Za-z]+\.\S{2,}|www\.[\dA-Za-z]+\.\S{2,})/;
const EMAIL_REGEX =
  /(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z\-]+\.)+[A-Za-z]{2,}))/;
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
