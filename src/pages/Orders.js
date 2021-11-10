import React, { useEffect, useState } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage";

import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
// import Box from "@material-ui/core/Box";
// import Collapse from "@material-ui/core/Collapse";
// import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
// import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
// import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { verifyToken } from "util/JwtHelper";
import { getAllOrderAvailableAndInCompleteApi } from "API/orders.api";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

// function createData(name, calories, fat, carbs, protein, price) {
//   return {
//     name,
//     calories,
//     fat,
//     carbs,
//     protein,
//     price,
//     history: [
//       { date: "2020-01-05", customerId: "11091700", amount: 3 },
//       { date: "2020-01-02", customerId: "Anonymous", amount: 1 },
//     ],
//   };
// }
function Row(props) {
  const { row } = props;
  // const [open, setOpen] = useState(false);
  const classes = useRowStyles();

  return (
    <React.Fragment>
      <TableRow className={classes.root}>
        <TableCell component="th" scope="row">
          {row?.createdAt?.split("T")?.[0]}
        </TableCell>
        <TableCell align="right">{row.phoneNumber}</TableCell>
        <TableCell align="right">{row.total}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}
Row.propTypes = {
  row: PropTypes.shape({
    calories: PropTypes.number.isRequired,
    carbs: PropTypes.number.isRequired,
    fat: PropTypes.number.isRequired,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        amount: PropTypes.number.isRequired,
        customerId: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
      })
    ).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    protein: PropTypes.number.isRequired,
  }).isRequired,
};

const Orders = ({ reloadPage, setReloadPage }) => {
  const [incompleteOrders, setIncompleteOrders] = useState([]);
  const fetchIncompleteOrders = async () => {
    const customerDetails = verifyToken();
    try {
      const orders = await getAllOrderAvailableAndInCompleteApi({
        phoneNumber: customerDetails.customer.phoneNumber,
      });
      reloadPage ? setReloadPage(false) : setReloadPage(true);
      if (orders) {
        setIncompleteOrders(orders);
      }
    } catch (error) {
      console.log("error", error);
      return;
    }
  };

  useEffect(() => {
    fetchIncompleteOrders();
  }, []);

  return (
    <div style={{ padding: 0 }}>
      <Typography style={{ width: "fit-content", margin: "auto" }}>
        Incompleted Orders
      </Typography>
      <TableContainer
        component={Paper}
        style={{ width: "fit-content", margin: "auto" }}
      >
        <Table
          aria-label="collapsible table"
          style={{
            display: "block",
            overflowX: "auto",
            width: "fit-content",
            margin: "auto",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell align="right">Grand Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incompleteOrders.map((row) => (
              <Row key={row.name} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Orders;
