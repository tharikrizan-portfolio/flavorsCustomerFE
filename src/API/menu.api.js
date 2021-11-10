import axios from "axios";
import { getToast } from "util/ToastHelper.js";

import {
  getLocalStorageProperty,
  setLocalStorageProperty,
} from "../util/LocalStorageHelper.js";

const rootUriCustomer = process.env.REACT_APP_API_URL_CUSTOMER;

export const getAllMenusApi = async () => {
  try {
    let menusLocalStorage = getLocalStorageProperty("flavors-menus");
    menusLocalStorage =
      menusLocalStorage !== "undefined" && JSON.parse(menusLocalStorage);
    let lastApiCall = getLocalStorageProperty("flavors-menus-api-called-time");
    lastApiCall = lastApiCall && Date.parse(lastApiCall);
    const currentTime = new Date();
    if (lastApiCall) {
      const timeDiff = (currentTime - lastApiCall) / (1000 * 60);
      if (timeDiff <= 5) {
        return Promise.resolve(menusLocalStorage);
      }
    }
    const { data } = await axios.get(`${rootUriCustomer}/menus-available`);
    if (data.success) {
      const menus = data.data.data.menus;
      setLocalStorageProperty("flavors-menus", JSON.stringify(menus));
      setLocalStorageProperty(
        "flavors-menus-api-called-time",
        currentTime.toString()
      );
      return Promise.resolve(data.data.data.menus);
    } else {
      getToast(false, data.data.message);
      return Promise.reject([]);
    }
  } catch (error) {
    getToast(false, error);
    return Promise.reject([]);
  }
};

//get menus by category

export const getAllMenusByCategoryApi = async ({ category }) => {
  const body = { category };
  try {
    let menusLocalStorage = getLocalStorageProperty(
      `flavors-menus-category-${category}`
    );
    menusLocalStorage =
      menusLocalStorage !== "undefined" && JSON.parse(menusLocalStorage);
    let lastApiCall = getLocalStorageProperty(
      `flavors-menus-category-${category}-api-called-time`
    );
    lastApiCall = lastApiCall && Date.parse(lastApiCall);
    const currentTime = new Date();
    if (lastApiCall) {
      const timeDiff = (currentTime - lastApiCall) / (1000 * 60);
      if (timeDiff <= 5) {
        return Promise.resolve(menusLocalStorage);
      }
    }
    const { data } = await axios.post(
      `${rootUriCustomer}/menus-by-category`,
      body
    );
    if (data.success) {
      const menus = data.data.data.menus;
      setLocalStorageProperty(
        `flavors-menus-category-${category}`,
        JSON.stringify(menus)
      );
      setLocalStorageProperty(
        `flavors-menus-category-${category}-api-called-time`,
        currentTime.toString()
      );
      return Promise.resolve(data.data.data.menus);
    } else {
      getToast(false, data.data.message);
      return Promise.reject([]);
    }
  } catch (error) {
    getToast(false, error);
    return Promise.reject([]);
  }
};
