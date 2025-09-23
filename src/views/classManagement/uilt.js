export const debounce = (cb, wait) => {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => cb.apply(context, args), wait);
  };
};
