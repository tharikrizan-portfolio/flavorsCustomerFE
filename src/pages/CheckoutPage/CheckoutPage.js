import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
// import CssBaseline from "@material-ui/core/CssBaseline";
// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

import PaymentDetails from "./PaymentDetails";
import OrderReview from "./OrderReview";
import DeliveryDetails from "./DeliveryDetails";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import {
  getLocalStorageProperty,
  removeLocalStorageProperty,
  setLocalStorageProperty,
} from "util/LocalStorageHelper";
import { verifyToken } from "util/JwtHelper";

import { createNewOrderApi } from "API/orders.api";
import { getAllMenusApi } from "API/menu.api";
import { getAllFlatOffersApi } from "API/flatOffers.api";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Flavors Restaurant Kalutara
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  layout: {
    width: "100%",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(2) * 2)]: {
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    // marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    // padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      // marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      // padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
    flexWrap: "wrap",
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

const steps = ["Your order", "Shipping address", "Payment details"];

function getStepContent(
  step,
  order,
  onChangeMenuQuantity,
  onDeleteMenuOrdered,
  onChangeAddress,
  onChangePhoneNumber,
  onChangeFirstName
) {
  switch (step) {
    case 0:
      return (
        <OrderReview
          order={order}
          onChangeMenuQuantity={onChangeMenuQuantity}
          onDeleteMenuOrdered={onDeleteMenuOrdered}
        />
      );

    case 1:
      return (
        <DeliveryDetails
          order={order}
          onChangeAddress={onChangeAddress}
          onChangePhoneNumber={onChangePhoneNumber}
          onChangeFirstName={onChangeFirstName}
        />
      );

    case 2:
      return <PaymentDetails order={order} />;
    default:
      throw new Error("Unknown step");
  }
}

export default function CheckoutPage({ reloadPage, setReloadPage }) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [menusHashMap, setMenusHashMap] = useState(0);
  const [flatOffers, setFlatOffers] = useState([]);
  const [selectedFlatOffer, setSelectedFlatOffer] = useState({});
  const [order, setOrder] = useState({
    phoneNumber: "",
    deliveryAddress: "",
    firstName: "",
    menus: [],
    total: "",
    discount: "",
    payable: "",
    flatOfferFreeMenu: {},
  });
  const handleNext = (event) => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  const onChangeAddress = (newAddress) => {
    setOrder({ ...order, deliveryAddress: newAddress });
  };

  const onChangePhoneNumber = (newPhoneNumber) => {
    setOrder({ ...order, phoneNumber: newPhoneNumber });
  };
  const onChangeFirstName = (newFirstName) => {
    setOrder({ ...order, firstName: newFirstName });
  };
  const onChangeMenuQuantity = (updatedMenu, qty, portion) => {
    let total = 0;
    let discount = 0;
    let localStorageUpdateMenu = {};

    const updatedOrderedMenus = order.menus.map((menu) => {
      //calculate discount or free Menus
      let discountCalc = 0;
      let freeMenuCalc = {};
      let offer = menusHashMap[menu.menuId]?.offer;
      let portion_ =
        updatedMenu.menuId === menu.menuId ? portion : menu.portion;
      if (
        offer?.isOfferAvailable &&
        qty >= offer?.quantityThresh &&
        portion_ === offer?.portionThresh
      ) {
        if (offer?.type === "discount" || offer?.type === "percentage") {
          discountCalc = offer?.discount;
        } else {
          discountCalc = 0;
          freeMenuCalc = {
            menu: offer.freeMenu.menu,
            name: offer.freeMenu.name,
            quantity:
              Math.floor(qty / offer?.quantityThresh) * offer.freeMenu.quantity,
            portion: offer.freeMenu.portion,
          };
        }
      }
      if (updatedMenu.menuId === menu.menuId) {
        let menuPrice =
          portion === "half" && menu.halfPrice > 0
            ? menu.halfPrice
            : menu.price;

        total +=
          qty * menuPrice -
          Math.floor(qty / offer?.quantityThresh) * discountCalc;
        discount += Math.floor(qty / offer?.quantityThresh) * discountCalc;

        localStorageUpdateMenu = {
          ...menu,
          purchasedQty: qty,
          payablePrice:
            qty * menuPrice -
            Math.floor(qty / offer?.quantityThresh) * discountCalc,
          freeMenu: freeMenuCalc,
          discount: Math.floor(qty / offer?.quantityThresh) * discountCalc,
          portion,
        };
        return {
          ...menu,
          purchasedQty: qty,
          payablePrice:
            qty * menuPrice -
            Math.floor(qty / offer?.quantityThresh) * discountCalc,
          discount: Math.floor(qty / offer?.quantityThresh) * discountCalc,
          freeMenu: freeMenuCalc,
          portion,
        };
      } else {
        total += menu.payablePrice;
        discount += menu.discount;
        return menu;
      }
    });

    updateLocalStorageCartMenu(localStorageUpdateMenu, qty, portion);
    setOrder({
      ...order,
      menus: updatedOrderedMenus,
      discount: discount,
      total: total + discount,
      payable: total,
    });
  };
  const onDeleteMenuOrdered = (deletedMenu) => {
    const updatedOrderedMenus = order.menus.filter(
      (menu) => deletedMenu.menuId !== menu.menuId
    );
    let total = 0;
    let discount = 0;
    let finalPay = 0;
    updatedOrderedMenus.forEach((menu) => {
      total += menu.payablePrice;
      discount += menu.discount;
    });
    finalPay = total;
    removeLocalStorageCartMenu(deletedMenu);
    setOrder({
      ...order,
      menus: updatedOrderedMenus,
      discount: discount,
      total: total + discount,
      payable: finalPay,
    });
  };
  const updateLocalStorageCartMenu = (menu, qty, portion) => {
    let cart = getLocalStorageProperty("flavors-customer-cart");
    if (cart && cart !== "undefined") {
      cart = JSON.parse(cart);
      cart = {
        ...cart,
        [menu.menuId]: {
          ...menu,
          menuId: menu.menuId,
          name: menu.name,
          price: menu.price,
          purchasedQty: qty,
          payablePrice: menu.payablePrice,
          discount: menu?.discount,
          freeMenu: menu?.freeMenu,
          portion,
        },
      };
    } else {
      cart = {
        [menu.menuId]: {
          ...menu,
          menuId: menu.menuId,
          name: menu.name,
          price: menu.price,
          purchasedQty: qty,
          payablePrice: menu.payablePrice,
          discount: menu?.discount,
          freeMenu: menu?.freeMenu,
          portion,
        },
      };
    }

    setLocalStorageProperty("flavors-customer-cart", JSON.stringify(cart));

    return;
  };
  const removeLocalStorageCartMenu = (menu) => {
    let cart = getLocalStorageProperty("flavors-customer-cart");
    cart = JSON.parse(cart);
    delete cart?.[menu.menuId];

    setLocalStorageProperty("flavors-customer-cart", JSON.stringify(cart));
    setLocalStorageProperty(
      "flavors-customer-cart-menu-count",
      Object.keys(cart).length
    );

    reloadPage ? setReloadPage(false) : setReloadPage(true);
    return;
  };
  const createOrder = async (e) => {
    // e.preventDefault();
    try {
      const newOrder = await createNewOrderApi(order);
      if (newOrder) {
        setOrder({});
        removeLocalStorageProperty("flavors-customer-cart");
        setLocalStorageProperty("flavors-customer-cart-menu-count", 0);
        reloadPage ? setReloadPage(false) : setReloadPage(true);
        window.location = "/orders";
      }
    } catch (error) {
      return;
    }
  };
  const fetchMenus = async () => {
    try {
      let menuList = await getAllMenusApi();
      const menusHash = menuList.reduce(
        (acc, cur) => ({
          ...acc,
          [cur._id]: {
            ...cur,
            _id: cur._id,
            name: cur.name,
            price: cur.price,
            offer: cur?.offer?.isOfferAvailable ? cur.offer : null,
          },
        }),
        {}
      );

      setMenusHashMap(menusHash);
    } catch (error) {
      setMenusHashMap({});
    }
  };

  const fetchFlatOffers = async () => {
    try {
      let offersResponse = await getAllFlatOffersApi();

      setFlatOffers(offersResponse);
    } catch (error) {
      setFlatOffers([]);
    }
  };
  const addFlatOfferDealsForOrder = (newOrder = order) => {
    console.log("called");
    let selectedOfferTemp = { billThresh: 0 };
    flatOffers.forEach((offer) => {
      if (parseInt(newOrder.total) >= parseInt(offer.billThresh)) {
        if (
          parseInt(selectedOfferTemp.billThresh) < parseInt(offer.billThresh)
        ) {
          selectedOfferTemp = offer;
        }
      }
    });

    if (selectedOfferTemp.billThresh > 0) {
      let selectedOfferTempType = selectedOfferTemp.type;
      if (selectedOfferTempType === "discount") {
        let billDiscount = selectedOfferTemp.discount;
        setOrder({
          ...newOrder,
          flatOfferFreeMenu: {},
          discount: newOrder.discount + billDiscount,
          payable: newOrder.payable - billDiscount,
          total: newOrder.total,
        });
      }
      if (selectedOfferTempType === "percentage") {
        let billDiscount = Math.floor(
          newOrder.total * (selectedOfferTemp.percentage / 100)
        );
        setOrder({
          ...newOrder,
          flatOfferFreeMenu: {},
          discount: newOrder.discount + billDiscount,
          payable: newOrder.payable - billDiscount,
          total: newOrder.total,
        });
      }
      if (selectedOfferTempType === "freeMenu") {
        let freeMenu_ = selectedOfferTemp.freeMenu;
        let newFlatOfferFreeMenu = {
          menu: freeMenu_.menu,
          name: freeMenu_.name,
          portion: freeMenu_.portion,
          quantity: freeMenu_.quantity,
        };
        setOrder({
          ...newOrder,
          flatOfferFreeMenu: newFlatOfferFreeMenu,
        });
      }

      setSelectedFlatOffer(selectedOfferTemp);
    } else {
      setOrder({
        ...newOrder,
        flatOfferFreeMenu: {},
      });
      setSelectedFlatOffer({});
    }
  };
  useEffect(() => {
    addFlatOfferDealsForOrder();
  }, [order.total, flatOffers]);

  useEffect(() => {
    //fetch flat Offers
    fetchFlatOffers();
    //fetchMenus
    fetchMenus();
    //set Menus , total payable and discount
    let cart = getLocalStorageProperty("flavors-customer-cart");
    let menusOrdered = [];
    let total = 0;
    let discount = 0;
    if (cart && cart !== "undefined") {
      cart = JSON.parse(cart);
      const menuIds = Object.keys(cart);
      menuIds.forEach((menuId) => {
        menusOrdered = [...menusOrdered, cart[menuId]];
        total += cart[menuId].payablePrice;
        discount += cart[menuId].discount;
      });
    } else {
      cart = {};
    }

    //get customer details from token
    const customerDetails = verifyToken();
    //set deliveryAddress
    const customerDeliveryAddress = customerDetails.customer?.address || "";
    //set phone Number
    const customerPhoneNumber = customerDetails.customer?.phoneNumber;
    //set first Name
    const customerFirstName = customerDetails.customer?.name || "";
    //setorder
    setOrder({
      deliveryAddress: customerDeliveryAddress,
      phoneNumber: customerPhoneNumber,
      discount: discount,
      menus: menusOrdered,
      total: total + discount,
      payable: total,
      firstName: customerFirstName,
    });
  }, []);

  return (
    <AnimationRevealPage>
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center">
            Checkout
          </Typography>
          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((label) => (
              <Step style={{ paddingTop: "8px" }} key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <React.Fragment>
            {activeStep === steps.length ? (
              <React.Fragment>
                <Typography variant="h5" gutterBottom>
                  Thank you for your order.
                </Typography>
                <Typography variant="subtitle1">
                  Your order number is #2001539. We have emailed your order
                  confirmation, and will send you an update when your order has
                  shipped.
                </Typography>
              </React.Fragment>
            ) : (
              <React.Fragment>
                {getStepContent(
                  activeStep,
                  order,
                  onChangeMenuQuantity,
                  onDeleteMenuOrdered,
                  onChangeAddress,
                  onChangePhoneNumber,
                  onChangeFirstName
                )}
                <div className={classes.buttons}>
                  {activeStep !== 0 && (
                    <Button onClick={handleBack} className={classes.button}>
                      Back
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(event) => {
                      activeStep === steps.length - 1
                        ? createOrder(event)
                        : handleNext(event);
                    }}
                    disabled={order?.menus?.length === 0}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? "Place order" : "Next"}
                  </Button>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        </Paper>
        <Copyright />
      </main>
    </AnimationRevealPage>
  );
}
