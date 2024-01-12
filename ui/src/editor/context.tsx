import * as React from "react";

import type { ApiUpload } from "./plugins/ImagesPlugin/types";

export type EditorContextValue = {
  apiUpload: ApiUpload;
};

const EditorContext = React.createContext<EditorContextValue>(
  {} as EditorContextValue,
);
const EditorContextProvider = EditorContext.Provider;

export { EditorContext, EditorContextProvider };
