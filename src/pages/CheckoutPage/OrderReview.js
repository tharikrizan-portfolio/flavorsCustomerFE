import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import { IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";

import { TextField } from "@material-ui/core";
import { Scrollbars } from "react-custom-scrollbars";
import { green } from "@material-ui/core/colors";

import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: theme.spacing(1, 0),
  },
  total: {
    fontWeight: 700,
  },
  title: {
    marginTop: theme.spacing(2),
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 80,
  },
}));

export default function OrderReview({
  order,
  onChangeMenuQuantity,
  onDeleteMenuOrdered,
}) {
  const classes = useStyles();
  const [orderState, setOrderState] = useState(order);

  useEffect(() => {
    setOrderState(order);
  }, [order]);

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Order summary
      </Typography>
      <List disablePadding>
        <Scrollbars style={{ height: 220 }}>
          {orderState.menus.map((product) => (
            <>
              <ListItem className={classes.listItem} key={product.name}>
                <ListItemText
                  primary={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(event) => {
                          event.preventDefault();
                          onDeleteMenuOrdered(product);
                        }}
                        size="small"
                      >
                        <DeleteIcon color="secondary" />
                      </IconButton>
                      <Typography>{product.name}</Typography>
                    </div>
                  }
                  secondary={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                        }}
                      >
                        <FormControl className={classes.formControl}>
                          <InputLabel id="demo-simple-select-label">
                            Portion
                          </InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={product.portion}
                            onChange={(event) => {
                              event.preventDefault();
                              onChangeMenuQuantity(
                                product,
                                product.purchasedQty,
                                event.target.value
                              );
                            }}
                          >
                            <MenuItem value="full">Full</MenuItem>
                            {product.halfPrice > 0 && (
                              <MenuItem value="half">Half</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                        <TextField
                          style={{
                            width: "20%",
                            marginRight: "10%",
                            marginLeft: "10%",
                          }}
                          id="outlined-number"
                          label="Quantity"
                          type="number"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={product.purchasedQty}
                          onChange={(event) => {
                            event.preventDefault();
                            onChangeMenuQuantity(
                              product,
                              event.target.value,
                              product.portion
                            );
                          }}
                        />
                        {/* <Typography>
                        {`${product.purchasedQty} X (${product.price} - ${product.discount}) = `}
                      </Typography> */}
                        <Typography
                        // style={{ marginTop: "5%", marginLeft: "5%" }}
                        >
                          {product.payablePrice}
                        </Typography>
                      </div>
                    </div>
                  }
                />
              </ListItem>
              {product?.freeMenu?.name !== undefined && (
                <ListItem
                  className={classes.listItem}
                  key={product.freeMenu.name}
                >
                  <ListItemText
                    style={{ color: green[500] }}
                    primary={product.freeMenu.name}
                    secondary={
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-start",
                          }}
                        >
                          <FormControl className={classes.formControl}>
                            <InputLabel id="demo-simple-select-label">
                              Portion
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              defaultValue={product.freeMenu.portion}
                            >
                              <MenuItem value={product.freeMenu.portion}>
                                {product.freeMenu.portion}
                              </MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            style={{
                              width: "20%",
                              marginRight: "10%",
                              marginLeft: "10%",
                            }}
                            id="outlined-number"
                            label="Quantity"
                            type="number"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            value={product.freeMenu.quantity}
                            disabled={true}
                          />

                          <Typography style={{ color: green[500] }}>
                            FREE
                          </Typography>
                        </div>
                      </div>
                    }
                  />
                </ListItem>
              )}
            </>
          ))}
          {orderState?.flatOfferFreeMenu?.name !== undefined && (
            <ListItem
              className={classes.listItem}
              key={orderState.flatOfferFreeMenu.name}
            >
              <ListItemText
                style={{ color: green[500] }}
                primary={orderState.flatOfferFreeMenu.name}
                secondary={
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                      }}
                    >
                      <FormControl className={classes.formControl}>
                        <InputLabel id="demo-simple-select-label">
                          Portion
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          defaultValue={orderState.flatOfferFreeMenu.portion}
                        >
                          <MenuItem
                            value={orderState.flatOfferFreeMenu.portion}
                          >
                            {orderState.flatOfferFreeMenu.portion}
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        style={{
                          width: "20%",
                          marginRight: "10%",
                          marginLeft: "10%",
                        }}
                        id="outlined-number"
                        label="Quantity"
                        type="number"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        value={orderState.flatOfferFreeMenu.quantity}
                        disabled={true}
                      />

                      <Typography style={{ color: green[500] }}>
                        FREE
                      </Typography>
                    </div>
                  </div>
                }
              />
            </ListItem>
          )}
        </Scrollbars>
      </List>
      <br />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" className={classes.total}>
            Total
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" className={classes.total}>
            {`${orderState.total} - ${orderState.discount} = ${orderState.payable}`}
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
