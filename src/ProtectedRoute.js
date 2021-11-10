import React from "react";

import { Route, Redirect } from "react-router-dom";
import { getLocalStorageProperty } from "./util/LocalStorageHelper";
import PropTypes from "prop-types";
import RestaurantComponentRenderer from "./RestaurantComponentRenderer";
export const ProtectedRoute = ({ name, type, ...rest }) => {
  const token = getLocalStorageProperty("flavors-customer-token");

  return (
    <Route
      {...rest}
      render={(props) => {
        if (token) {
          return (
            <RestaurantComponentRenderer type={type} name={name} {...props} />
          );
        } else {
          return <Redirect to={"/login"} />;
        }
      }}
    />
  );
};

ProtectedRoute.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
};
