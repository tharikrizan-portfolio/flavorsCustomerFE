import axios from "axios";
import { getToast } from "util/ToastHelper.js";

import {
  getLocalStorageProperty,
  setLocalStorageProperty,
} from "../util/LocalStorageHelper.js";

const rootUriCustomer = process.env.REACT_APP_API_URL_CUSTOMER;

export const getAllFlatOffersApi = async () => {
  try {
    let offersLocalStorage = getLocalStorageProperty("flavors-flat-offers");
    let lastApiCall = getLocalStorageProperty(
      "flavors-flat-offers-api-called-time"
    );

    offersLocalStorage =
      offersLocalStorage !== "undefined" && JSON.parse(offersLocalStorage);
    lastApiCall = lastApiCall && Date.parse(lastApiCall);

    const currentTime = new Date();
    if (lastApiCall) {
      const timeDiff = (currentTime - lastApiCall) / (1000 * 60);
      if (timeDiff <= 5) {
        return Promise.resolve(offersLocalStorage);
      }
    }
    const { data } = await axios.get(
      `${rootUriCustomer}/flat-offers-available`
    );
    if (data.success) {
      const menus = data.data.data.offers;

      setLocalStorageProperty("flavors-flat-offers", JSON.stringify(menus));
      setLocalStorageProperty(
        "flavors-flat-offers-api-called-time",
        currentTime.toString()
      );
      return Promise.resolve(menus);
    } else {
      getToast(false, data.data.message);
      return Promise.reject([]);
    }
  } catch (error) {
    getToast(false, error);
    return Promise.reject([]);
  }
};
