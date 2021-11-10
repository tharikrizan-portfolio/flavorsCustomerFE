export const setLocalStorageProperty = (property, value) => {
  localStorage.setItem(property, value);
};
export const getLocalStorageProperty = (property) => {
  return localStorage.getItem(property);
};
export const removeLocalStorageProperty = (property) => {
  localStorage.removeItem(property);
};
