export const usePinnings = () => {
  // const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  // const updateColumnPinning = useCallback(() => {
  //   setColumnPinning((prevPinning) => {
  //     const newPinnings = {
  //       left: columnsForTTTable
  //         .filter((x) => x.id && x.meta?.fixed === "left")
  //         .map((x) => x.id!),
  //       right: columnsForTTTable
  //         .filter((x) => x.id && x.meta?.fixed === "right")
  //         .map((x) => x.id!),
  //     };
  //     return _.isEqual(prevPinning, newPinnings) ? prevPinning : newPinnings;
  //   });
  // }, [columnsForTTTable]);
  // // Use requestAnimationFrame to batch updates
  // useEffect(() => {
  //   const rafId = requestAnimationFrame(updateColumnPinning);
  //   return () => cancelAnimationFrame(rafId);
  // }, [updateColumnPinning]);
};
