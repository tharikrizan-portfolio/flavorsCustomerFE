import axios from "axios";
import { getToast } from "util/ToastHelper.js";
import { setLocalStorageProperty } from "../util/LocalStorageHelper.js";

const rootUriCustomer = process.env.REACT_APP_API_URL_CUSTOMER;

export const sendOTP = async ({ phoneNumber }) => {
  const body = { phoneNumber };

  try {
    const { data } = await axios.post(`${rootUriCustomer}/send-otp`, body);
    if (data.data.data.success) {
      const verifyId = data.data.data.verifyId;
      setLocalStorageProperty("flavors-verifyId", verifyId);
      getToast(true, "OTP Sent to your mobile!");
      return Promise.resolve(verifyId);
    } else {
      getToast(false, "OTP sending Failed !");
      return Promise.resolve();
    }
  } catch (error) {
    getToast(false, `error : ${error}`);
    Promise.reject(error);
  }
};

export const verifyOtp = async ({ phoneNumber, verifyCode, verifyId }) => {
  const body = { phoneNumber, verifyCode, verifyId };

  try {
    const { data } = await axios.post(`${rootUriCustomer}/verify-otp`, body);
    if (data.data.data.success) {
      getToast(true, "OTP Verification Success!");
      return Promise.resolve(true);
    } else {
      getToast(false, "OTP Verification Failed !");
      return Promise.resolve(false);
    }
  } catch (error) {
    getToast(false, `error : ${error}`);
    return Promise.reject(error);
  }
};

export const spammerCount = async ({ phoneNumber }) => {
  const body = { phoneNumber };

  try {
    const { data } = await axios.post(`${rootUriCustomer}/spammer-count`, body);
    if (data.data.data.success) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }
  } catch (error) {
    alert(`error : ${error}`);
    return Promise.reject(error);
  }
};

export const login = async ({ phoneNumber }) => {
  const body = { phoneNumber };
  try {
    const { data } = await axios.post(`${rootUriCustomer}/login`, body);
    if (data.data.data.success) {
      setLocalStorageProperty("flavors-customer-token", data.data.data.token);
      const message = data.data?.message || "";
      getToast(true, message);
      return Promise.resolve(true);
    } else {
      getToast(false, "Login Failure");
      return Promise.resolve(false);
    }
  } catch (error) {
    getToast(false, "Login Failure");
    console.error("login api Error", error);
  }
};

export const hiddenLogin = async ({ phoneNumber }) => {
  const body = { phoneNumber };
  try {
    const { data } = await axios.post(`${rootUriCustomer}/login`, body);
    if (data.data.data.success) {
      setLocalStorageProperty("flavors-customer-token", data.data.data.token);
      // const message = data.data?.message || "";
      // getToast(true, message);
      return Promise.resolve(true);
    } else {
      // getToast(false, "Login Failure");
      return Promise.resolve(false);
    }
  } catch (error) {
    //getToast(false, "Login Failure");
    console.error("login api Error", error);
  }
};
