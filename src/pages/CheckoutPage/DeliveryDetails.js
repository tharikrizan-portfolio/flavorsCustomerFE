import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState } from "react";

export default function DeliveryDetails({
  order,
  onChangeAddress,
  onChangePhoneNumber,
  onChangeFirstName,
}) {
  const [orderState, setOrderState] = useState(order);

  useEffect(() => {
    setOrderState(order);
  }, [order]);
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Delivery Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="firstName"
            name="firstName"
            label="First name"
            fullWidth
            autoComplete="given-name"
            value={orderState?.firstName}
            onChange={(e) => {
              e.preventDefault();
              onChangeFirstName(e.target.value);
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            id="address"
            name="address"
            label="Address"
            fullWidth
            autoComplete="shipping address-line"
            value={orderState?.deliveryAddress}
            onChange={(e) => {
              e.preventDefault();
              onChangeAddress(e.target.value);
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="phoneNumber"
            name="phoneNumber"
            label="Phone Number"
            fullWidth
            autoComplete="phoneNumber"
            value={orderState.phoneNumber}
            onChange={(e) => {
              e.preventDefault();
              onChangePhoneNumber(e.target.value);
            }}
            disabled={true}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
