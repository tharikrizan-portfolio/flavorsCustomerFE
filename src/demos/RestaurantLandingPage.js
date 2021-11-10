import React, { useEffect, useState } from "react";
import tw from "twin.macro";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import Hero from "components/hero/TwoColumnWithVideo.js";
import Features from "components/features/ThreeColSimple.js";
import MainFeature from "components/features/TwoColWithButton.js";
import MainFeature2 from "components/features/TwoColSingleFeatureWithStats2.js";
import TabGrid from "components/cards/TabCardGrid.js";
// import Testimonial from "components/testimonials/ThreeColumnWithProfileImage.js";
// import DownloadApp from "components/cta/DownloadApp.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";

import chefIconImageSrc from "images/chef-icon.svg";
import celebrationIconImageSrc from "images/celebration-icon.svg";
import shopIconImageSrc from "images/shop-icon.svg";
import SliderCards from "components/cards/ThreeColSlider.js";
import Fab from "@material-ui/core/Fab";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import "../components/headers/cart.css";
import { getAllFlatOffersApi } from "API/flatOffers.api";

const useStyles = makeStyles((theme) => ({
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    color: theme.palette.common.white,
    backgroundColor: green[500],
    "&:hover": {
      backgroundColor: green[600],
    },
    zIndex: 3,
  },
}));
export default ({ reloadPage, setReloadPage, numberOfMenus }) => {
  const Subheading = tw.span`tracking-wider text-sm font-medium`;
  const HighlightedText = tw.span`bg-primary-500 text-gray-100 px-4 transform -skew-x-12 inline-block`;
  // const HighlightedTextInverse = tw.span`bg-gray-100 text-primary-500 px-4 transform -skew-x-12 inline-block`;
  const Description = tw.span`inline-block mt-8`;
  const imageCss = tw`rounded-4xl`;
  const classes = useStyles();
  const [flatOffers, setFlatOffers] = useState([]);
  const [flatOfferComponents, setFlatOfferComponents] = useState();

  const fetchOffers = async () => {
    try {
      let offersResponse = await getAllFlatOffersApi();

      let flatOfferComponents_ = offersResponse.map((flatOffer) => {
        let flatOfferType = flatOffer.type;
        let highlightText =
          flatOfferType === "percentage"
            ? `${flatOffer.percentage} % OFF`
            : flatOfferType === "discount"
            ? `RS.${flatOffer.discount} OFF`
            : `${flatOffer.freeMenu.quantity} ${
                flatOffer.freeMenu.portion === "full" ? "Large" : "Small"
              } ${flatOffer.freeMenu.name} FREE`;
        return (
          <>
            <MainFeature
              subheading={<Subheading>{flatOffer.name}</Subheading>}
              heading={
                <>
                  {`FOR ALL BILLS ABOVE RS. ${flatOffer.billThresh}/= GET`}
                  <wbr /> <HighlightedText>{highlightText}</HighlightedText>
                </>
              }
              description={
                <Description>
                  {`${flatOffer.description}`}
                  <br />
                  <br />
                </Description>
              }
              buttonRounded={false}
              textOnLeft={false}
              primaryButtonText="Latest Offers"
              imageSrc={flatOffer.s3Urls.lg}
              imageCss={imageCss}
              imageDecoratorBlob={true}
              imageDecoratorBlobCss={tw`left-1/2 -translate-x-1/2 md:w-32 md:h-32 opacity-25`}
            />
          </>
        );
      });

      setFlatOfferComponents(flatOfferComponents_);
      setFlatOffers(offersResponse);
    } catch (error) {
      setFlatOffers([]);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // const theme = useTheme();
  return (
    <AnimationRevealPage>
      <Fab
        aria-label={"cart"}
        className={classes.fab}
        color="inherit"
        onClick={() => (window.location = "/cart")}
      >
        <span class="badge badge-warning" id="lblCartCount">
          {numberOfMenus}
        </span>
        <ShoppingCartIcon />
      </Fab>
      <Hero
        heading={
          <>
            Delicious & Affordable{" "}
            <HighlightedText>Meals Near You.</HighlightedText>
          </>
        }
        description="We make dining an experience for you !"
        imageSrc="https://flavors-restaurant.s3.ap-south-1.amazonaws.com/menu-images/lg/menu-image-1627760785595-logo-new.jpg"
        imageCss={imageCss}
        imageDecoratorBlob={true}
        primaryButtonText="Order Now"
        watchVideoButtonText="Meet The Chefs"
        primaryButtonUrl="#menus"
      />
      <a name="menus"></a>
      {flatOfferComponents}
      <SliderCards reloadPage={reloadPage} setReloadPage={setReloadPage} />
      {/* TabGrid Component also accepts a tabs prop to customize the tabs and its content directly. Please open the TabGrid component file to see the structure of the tabs props.*/}
      {/* eslint-disable-next-line */}

      <TabGrid
        heading={
          <>
            Checkout our <HighlightedText>menu.</HighlightedText>
          </>
        }
        reloadPage={reloadPage}
        setReloadPage={setReloadPage}
      />
      <Features
        heading={
          <>
            Amazing <HighlightedText>Services.</HighlightedText>
          </>
        }
        cards={[
          {
            imageSrc: shopIconImageSrc,
            title: "Delivery FREE",
            description:
              "Free Delivery within Kalutara City Limits, Minimum Order required for other areas",
            // url: "https://google.com",
          },
          {
            imageSrc: chefIconImageSrc,
            title: "Professional Chefs",
            description: "We have the best Chefs in the town",
            // url: "https://timerse.com",
          },
          {
            imageSrc: celebrationIconImageSrc,
            title: "Catering On special Occations",
            description: "We take Bulk orders for your special occations",
            // url: "https://reddit.com",
          },
        ]}
        imageContainerCss={tw`p-2!`}
        imageCss={tw`w-20! h-20!`}
      />
      <MainFeature2
        subheading={<Subheading>A Reputed Brand</Subheading>}
        heading={
          <>
            Why <HighlightedText>Choose Us ?</HighlightedText>
          </>
        }
        statistics={[
          {
            key: "Orders",
            value: "10000+",
          },
          {
            key: "Customers",
            value: "1000+",
          },
          {
            key: "Chefs",
            value: "5+",
          },
        ]}
        primaryButtonText="Order Now"
        primaryButtonUrl="#menus"
        imageInsideDiv={false}
        imageSrc="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEzNzI2fQ&auto=format&fit=crop&w=768&q=80"
        imageCss={Object.assign(tw`bg-cover`, imageCss)}
        imageContainerCss={tw`md:w-1/2 h-auto`}
        imageDecoratorBlob={true}
        imageDecoratorBlobCss={tw`left-1/2 md:w-32 md:h-32 -translate-x-1/2 opacity-25`}
        textOnLeft={true}
      />
      {/* <Testimonial
        subheading=""
        heading={
          <>
            Customers <HighlightedText>Love Us.</HighlightedText>
          </>
        }
      /> */}
      {/* <DownloadApp
        text={
          <>
            People around you are ordering delicious meals using the{" "}
            <HighlightedTextInverse>Treact App.</HighlightedTextInverse>
          </>
        }
      /> */}
      <Footer />
    </AnimationRevealPage>
  );
};
