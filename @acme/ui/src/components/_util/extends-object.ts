/* eslint-disable @typescript-eslint/no-explicit-any */

// copied https://github.com/ant-design/ant-design-mobile/blob/d3b3bae/src/utils/with-default-props.tsx
function mergeProperties<A, B>(a: A, b: B): B & A;
function mergeProperties<A, B, C>(a: A, b: B, c: C): C & B & A;
function mergeProperties<A, B, C, D>(a: A, b: B, c: C, d: D): D & C & B & A;
function mergeProperties(...items: any[]) {
  const returnValue: any = {};
  items.forEach((item) => {
    if (item) {
      Object.keys(item).forEach((key) => {
        if (item[key] !== undefined) {
          returnValue[key] = item[key];
        }
      });
    }
  });
  return returnValue;
}

export default mergeProperties;
