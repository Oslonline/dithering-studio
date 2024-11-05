const PatternDrawer = (data: Uint8ClampedArray, width: number, height: number, pattern: string) => {
  const imageData = new ImageData(data, width, height);

  switch (pattern) {
    case "2":
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const pxIndex = (y * width + x) * 4;
          imageData.data[pxIndex] = 255; // R
          imageData.data[pxIndex + 1] = 255; // G
          imageData.data[pxIndex + 2] = 255; // B
          imageData.data[pxIndex + 3] = 255; // A
        }
      }
      break;

    case "3":
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const pxIndex = (y * width + x) * 4;
          imageData.data[pxIndex] = 0; // R
          imageData.data[pxIndex + 1] = 0; // G
          imageData.data[pxIndex + 2] = 0; // B
          imageData.data[pxIndex + 3] = 255; // A
        }
      }
      break;

    case "4":
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const pxIndex = (y * width + x) * 4;
          if ((x + y) % 4 === 0) {
            imageData.data[pxIndex] = 0; // R
            imageData.data[pxIndex + 1] = 0; // G
            imageData.data[pxIndex + 2] = 0; // B
            imageData.data[pxIndex + 3] = 255; // A
          } else {
            imageData.data[pxIndex] = 255; // R
            imageData.data[pxIndex + 1] = 255; // G
            imageData.data[pxIndex + 2] = 255; // B
            imageData.data[pxIndex + 3] = 255; // A
          }
        }
      }
      break;

    case "5":
      for (let y = 0; y < height; y += 4) {
        for (let x = y % 8 === 0 ? 0 : 2; x < width; x += 4) {
          const pxIndex = (y * width + x) * 4;
          imageData.data[pxIndex] = 0; // R
          imageData.data[pxIndex + 1] = 0; // G
          imageData.data[pxIndex + 2] = 0; // B
          imageData.data[pxIndex + 3] = 255; // A
        }
      }
      break;

    case "6":
      const bayerMatrix = [
        [0, 8, 2, 10],
        [12, 4, 14, 6],
        [3, 11, 1, 9],
        [15, 7, 13, 5],
      ];
      const matrixSize = bayerMatrix.length;
      const scaleFactor = 16;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pxIndex = (y * width + x) * 4;
          const brightness = data[pxIndex];
          const threshold = (bayerMatrix[y % matrixSize][x % matrixSize] / scaleFactor) * 255;

          const value = brightness < threshold ? 0 : 255;
          imageData.data[pxIndex] = value;
          imageData.data[pxIndex + 1] = value;
          imageData.data[pxIndex + 2] = value;
          imageData.data[pxIndex + 3] = 255; // A
        }
      }
      break;
    default:
      break;
  }

  return imageData;
};

export default PatternDrawer;
