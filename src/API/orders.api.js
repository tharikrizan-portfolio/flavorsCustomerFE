import axios from "axios";
import { getToast } from "util/ToastHelper.js";

import {
  getLocalStorageProperty,
  setLocalStorageProperty,
} from "../util/LocalStorageHelper.js";
import { hiddenLogin } from "./loginOut.api.js";

const getToken = () => getLocalStorageProperty("flavors-customer-token");
const rootUriCustomer = process.env.REACT_APP_API_URL_CUSTOMER;

axios.interceptors.request.use(function (config) {
  config.headers.Authorization = "bearer " + getToken();
  return config;
});

export const createNewOrderApi = async ({
  phoneNumber,
  deliveryAddress,
  firstName,
  menus,
  flatOfferFreeMenu,
  total,
  discount,
  payable,
}) => {
  const body = {
    phoneNumber,
    deliveryAddress,
    firstName,
    menus,
    flatOfferFreeMenu,
    total,
    discount,
    payable,
  };

  try {
    //update user info
    await axios.post(`${rootUriCustomer}/update-customer-info`, {
      phoneNumber,
      address: deliveryAddress,
      name: firstName,
    });
    await hiddenLogin({ phoneNumber: phoneNumber });
    const { data } = await axios.post(`${rootUriCustomer}/order`, body);
    if (data.success) {
      getToast(true, data.data.message);
      return Promise.resolve(data.data.data.order);
    }
    getToast(false, data.data.message);
  } catch (error) {
    getToast(false, error);
    return Promise.reject();
  }
};

export const getAllOrderAvailableAndInCompleteApi = async ({ phoneNumber }) => {
  let incompleteOrdersLocalStorage = getLocalStorageProperty(
    "flavors-incomplete-orders"
  );
  incompleteOrdersLocalStorage =
    incompleteOrdersLocalStorage !== "undefined" &&
    JSON.parse(incompleteOrdersLocalStorage);
  let lastApiCall = getLocalStorageProperty(
    "flavors-incomplete-orders-api-called-time"
  );
  lastApiCall = lastApiCall && Date.parse(lastApiCall);
  const currentTime = new Date();
  if (lastApiCall) {
    const timeDiff = (currentTime - lastApiCall) / (1000 * 5);
    if (timeDiff <= 5) {
      return Promise.resolve(incompleteOrdersLocalStorage);
    }
  }
  const body = { phoneNumber };
  try {
    const { data } = await axios.post(
      `${rootUriCustomer}/order-available`,
      body
    );
    if (data.success) {
      const orders = data.data.data.orders;
      setLocalStorageProperty(
        "flavors-incomplete-orders",
        JSON.stringify(orders)
      );
      setLocalStorageProperty(
        "flavors-incomplete-orders-count",
        JSON.stringify(orders.length)
      );
      setLocalStorageProperty(
        "flavors-incomplete-orders-api-called-time",
        currentTime.toString()
      );
      return Promise.resolve(orders);
    } else {
      getToast(false, data.data.message);
      return Promise.reject([]);
    }
  } catch (error) {
    getToast(false, error);
    return Promise.reject([]);
  }
};
