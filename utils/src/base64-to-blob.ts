export function base64ToBlob(
  base64Data: string,
  contentType = "",
  sliceSize = 512,
) {
  const byteCharacters = Buffer.from(base64Data, "base64").toString("binary");
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers: number[] = Array.from({ length: slice.length });
    for (let index = 0; index < slice.length; index++) {
      byteNumbers[index] = slice.codePointAt(index)!;
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}
