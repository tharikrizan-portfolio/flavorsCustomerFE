import jwt from "jsonwebtoken";
import {
  getLocalStorageProperty,
  removeLocalStorageProperty,
} from "./LocalStorageHelper";
const SECRET = process.env.REACT_APP_JWT_SECRET;

export const verifyToken = () => {
  const token = getLocalStorageProperty("flavors-customer-token");

  if (token) {
    let customerDetails = {};
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        removeLocalStorageProperty("flavors-customer-token");
        return false;
      }
      customerDetails = decoded;
      return decoded;
    });
    return customerDetails;
  } else {
    return false;
  }
};
