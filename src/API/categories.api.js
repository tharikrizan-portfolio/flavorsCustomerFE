import axios from "axios";
import { getToast } from "util/ToastHelper.js";
import {
  getLocalStorageProperty,
  setLocalStorageProperty,
} from "../util/LocalStorageHelper.js";

const rootUriCustomer = process.env.REACT_APP_API_URL_CUSTOMER;
export const getAllCategoriesApi = async () => {
  try {
    let categoriesLocalStorage = getLocalStorageProperty("flavors-categories");
    categoriesLocalStorage =
      categoriesLocalStorage !== "undefined" &&
      JSON.parse(categoriesLocalStorage);
    let lastApiCall = getLocalStorageProperty(
      "flavors-categories-api-called-time"
    );
    lastApiCall = lastApiCall && Date.parse(lastApiCall);
    const currentTime = new Date();
    if (lastApiCall) {
      const timeDiff = (currentTime - lastApiCall) / (1000 * 60);
      if (timeDiff <= 5) {
        return Promise.resolve(categoriesLocalStorage);
      }
    }
    const { data } = await axios.get(`${rootUriCustomer}/category`);

    if (data.success) {
      const categories = data.data.data.categories;
      setLocalStorageProperty("flavors-categories", JSON.stringify(categories));
      setLocalStorageProperty(
        "flavors-categories-api-called-time",
        currentTime.toString()
      );
      return Promise.resolve(categories);
    } else {
      getToast(false, data.data.message);
      return Promise.reject([]);
    }
  } catch (error) {
    getToast(false, error);
    return Promise.reject([]);
  }
};
