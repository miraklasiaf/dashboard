export const getImageSize = (image) =>
  new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => {
      resolve(i);
    };
    i.src = image;
  });
