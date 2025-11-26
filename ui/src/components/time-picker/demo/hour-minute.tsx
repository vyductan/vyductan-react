"use client";

import type React from "react";
import dayjs from "dayjs";

import { TimePicker } from "..";

const format = "HH:mm";

const App: React.FC = () => (
  <TimePicker defaultValue={dayjs("12:08", format)} format={format} />
);

export default App;
