import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const getToast = (isSuccess, message) => {
  return isSuccess
    ? MySwal.fire({
        title: `<p>Success</p>`,
        footer: "Copyright 2018",
        didOpen: () => {
          MySwal.clickConfirm();
        },
      }).then(() => {
        return MySwal.fire(`<p>${message}</p>`);
      })
    : MySwal.fire({
        title: `<p>Fail</p>`,
        footer: "Copyright 2018",
        didOpen: () => {
          MySwal.clickConfirm();
        },
      }).then(() => {
        return MySwal.fire(`<p>${message}</p>`);
      });
};
