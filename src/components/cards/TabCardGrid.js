import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import { Container, ContentWithPaddingXl } from "components/misc/Layouts.js";
import { SectionHeading } from "components/misc/Headings.js";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons.js";
import { ReactComponent as StarIcon } from "images/star-icon.svg";
import { ReactComponent as SvgDecoratorBlob1 } from "images/svg-decorator-blob-5.svg";
import { ReactComponent as SvgDecoratorBlob2 } from "images/svg-decorator-blob-7.svg";
import { getAllMenusByCategoryApi } from "API/menu.api";
import { getAllCategoriesApi } from "API/categories.api";
import {
  getLocalStorageProperty,
  setLocalStorageProperty,
} from "util/LocalStorageHelper";
import { getToast } from "util/ToastHelper";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

const HeaderRow = tw.div`flex justify-between items-center flex-col xl:flex-row`;
const Header = tw(SectionHeading)``;
const TabsControl = tw.div`flex flex-wrap bg-gray-200 px-2 py-2 rounded leading-none mt-12 xl:mt-0`;

const TabControl = styled.div`
  ${tw`cursor-pointer px-6 py-3 mt-2 sm:mt-0 sm:mr-2 last:mr-0 text-gray-600 font-medium rounded-sm transition duration-300 text-sm sm:text-base w-1/2 sm:w-auto text-center`}
  &:hover {
    ${tw`bg-gray-300 text-gray-700`}
  }
  ${(props) => props.active && tw`bg-primary-500! text-gray-100!`}
  }
`;

const TabContent = tw(
  motion.div
)`mt-6 flex flex-wrap sm:-mr-10 md:-mr-6 lg:-mr-12`;
const CardContainer = tw.div`mt-10 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 sm:pr-10 md:pr-6 lg:pr-12`;
const Card = tw(
  motion.a
)`bg-gray-200 rounded-b block max-w-xs mx-auto sm:max-w-none sm:mx-0`;
const CardImageContainer = styled.div`
  ${(props) =>
    css`
      background-image: url("${props.imageSrc}");
    `}
  ${tw`h-56 xl:h-64 bg-center bg-cover relative rounded-t`}
`;
const CardRatingContainer = tw.div`leading-none absolute inline-flex bg-gray-100 bottom-0 left-0 ml-4 mb-4 rounded-full px-5 py-2 items-end`;
const CardRating = styled.div`
  ${tw`mr-1 text-sm font-bold flex items-end`}
  svg {
    ${tw`w-4 h-4 fill-current text-orange-400 mr-1`}
  }
`;

const CardHoverOverlay = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.5);
  ${tw`absolute inset-0 flex justify-center items-center`}
`;
const CardButton = tw(PrimaryButtonBase)`text-sm`;

// const CardReview = tw.div`font-medium text-xs text-gray-600`;

const CardText = tw.div`p-4 text-gray-900`;
const CardTitle = tw.h5`text-lg font-semibold group-hover:text-primary-500`;
const CardContent = tw.p`mt-1 text-sm font-medium text-gray-600`;
const CardPrice = tw.p`mt-4 text-xl font-bold`;

const DecoratorBlob1 = styled(SvgDecoratorBlob1)`
  ${tw`pointer-events-none -z-20 absolute right-0 top-0 h-64 w-64 opacity-15 transform translate-x-2/3 -translate-y-12 text-pink-400`}
`;
const DecoratorBlob2 = styled(SvgDecoratorBlob2)`
  ${tw`pointer-events-none -z-20 absolute left-0 bottom-0 h-80 w-80 opacity-15 transform -translate-x-2/3 text-primary-500`}
`;
const PrimaryBuyButton = tw(
  PrimaryButtonBase
)`mt-auto sm:text-lg rounded-none w-full rounded sm:rounded-none sm:rounded-br-4xl py-3 sm:py-6`;

export default ({
  heading = "Checkout the Menu",
  reloadPage,
  setReloadPage,
}) => {
  const [menus, setMenus] = useState({});
  const [categoriesHashMap, setCategoriesHashMap] = useState({});

  const [tabsKeys, setTabsKeys] = useState(Object.keys(categoriesHashMap));
  const [activeTab, setActiveTab] = useState(tabsKeys[0]);
  const [screenbrk, setScreenbrk] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      let categoriesList = await getAllCategoriesApi();
      const categoriesHash = categoriesList.reduce(
        (acc, cur) => ({ ...acc, [cur.name]: { id: cur._id } }),
        {}
      );
      let newMenus = {};
      await Promise.all(
        categoriesList.map(async (category, index) => {
          let menusResponse = await getAllMenusByCategoryApi({
            category: category?.name,
          });
          newMenus = { ...newMenus, [category.name]: menusResponse };
        })
      );

      setMenus(newMenus);
      setCategoriesHashMap(categoriesHash);
      setTabsKeys(Object.keys(categoriesHash));
      setActiveTab(Object.keys(categoriesHash)[0]);

      // return Promise.resolve({ categoriesHash });
    } catch (error) {
      setCategoriesHashMap({});
      setTabsKeys([]);
    }
    setIsLoading(false);
  };
  const onBuyButtonClicked = (menu) => {
    //calculate discount or free Menus
    let discountCalc = 0;
    let freeMenuCalc = {};
    let offer = menu?.offer;
    if (offer?.isOfferAvailable && 1 >= offer?.quantityThresh) {
      if (offer?.type === "discount" || offer?.type === "percentage") {
        discountCalc = offer?.discount;
      } else {
        discountCalc = 0;
        freeMenuCalc = {
          menu: offer.freeMenu.menu,
          name: offer.freeMenu.name,
          quantity: offer.freeMenu.quantity,
          portion: offer.freeMenu.portion,
        };
      }
    }
    let cart = getLocalStorageProperty("flavors-customer-cart");
    if (cart && cart !== "undefined") {
      cart = JSON.parse(cart);
      cart = {
        ...cart,
        [menu._id]: {
          menuId: menu._id,
          name: menu.name,
          price: menu.price,
          purchasedQty: 1,
          payablePrice: menu.price - discountCalc,
          discount: discountCalc,
          freeMenu: freeMenuCalc,
          isHalf: menu.isHalf,
          halfPrice: menu.halfPrice,
          portion: "full",
        },
      };
    } else {
      cart = {
        [menu._id]: {
          menuId: menu._id,
          name: menu.name,
          price: menu.price,
          purchasedQty: 1,
          payablePrice: menu.price - discountCalc,
          discount: discountCalc,
          freeMenu: freeMenuCalc,
          isHalf: menu.isHalf,
          halfPrice: menu.halfPrice,
          portion: "full",
        },
      };
    }
    setLocalStorageProperty("flavors-customer-cart", JSON.stringify(cart));
    setLocalStorageProperty(
      "flavors-customer-cart-menu-count",
      Object.keys(cart).length
    );
    reloadPage ? setReloadPage(false) : setReloadPage(true);
    getToast(true, "Added to cart");

    return;
  };
  const halfPriceComponent = (card) => {
    return card?.offer?.isOfferAvailable &&
      (card?.offer?.type === "discount" ||
        card?.offer?.type === "percentage") &&
      card?.offer?.quantityThresh === 1 &&
      (card?.offer?.portionThresh === "half" ||
        card?.offer?.portionThresh === "any") &&
      card?.offer?.discount > 0 ? (
      <React.Fragment>
        <CardPrice
          style={{
            display: "flex",
          }}
        >
          <span
            style={{
              textDecorationLine: "line-through",
              WebkitTextDecorationLine: "line-through",
              textDecorationColor: "red",
              WebkitTextDecorationColor: "red",
              textDecorationThickness: "1px",
              WebkitTextDecorationStyle: "solid",
              marginRight: "6%",
            }}
          >
            {`Half RS.${card.halfPrice}`}
          </span>
          {card?.offer?.type === "discount" ? (
            <span>{`Half RS.${card.halfPrice - card.discount}`}</span>
          ) : (
            <span>
              {`Half RS.${
                card.halfPrice - (card.halfPrice * card.percentage) / 100
              }`}
            </span>
          )}
        </CardPrice>
      </React.Fragment>
    ) : (
      <>
        <CardPrice>{`Half RS.${card.halfPrice}`}</CardPrice>
      </>
    );
  };
  const fullPriceComponent = (card) => {
    return card?.offer?.isOfferAvailable &&
      (card?.offer?.type === "discount" ||
        card?.offer?.type === "percentage") &&
      card?.offer?.quantityThresh === 1 &&
      (card?.offer?.portionThresh === "full" ||
        card?.offer?.portionThresh === "any") &&
      card?.offer?.discount > 0 ? (
      <React.Fragment>
        <CardPrice
          style={{
            display: "flex",
          }}
        >
          <span
            style={{
              textDecorationLine: "line-through",
              WebkitTextDecorationLine: "line-through",
              textDecorationColor: "red",
              WebkitTextDecorationColor: "red",
              textDecorationThickness: "1px",
              WebkitTextDecorationStyle: "solid",
              marginRight: "6%",
            }}
          >
            {`Full RS.${card.price}`}
          </span>
          <span>{`Full RS.${card.price - card?.offer?.discount}`}</span>
        </CardPrice>
      </React.Fragment>
    ) : (
      <>
        <CardPrice>{`Full RS.${card.price}`}</CardPrice>
      </>
    );
  };
  useEffect(() => {
    fetchCategories();
    const { width, height } = getWindowDimensions();
    //set Screen break point
    let brkPoint = width > 800 ? "lg" : width > 450 ? "md" : "sm";
    setScreenbrk(brkPoint);
  }, []);

  if (isLoading) {
    return (
      <Container>
        <ContentWithPaddingXl>
          <HeaderRow>
            <Header>{heading}</Header>
            <TabContent>
              <Loader type="Puff" color="#00BFFF" height={100} width={100} />
            </TabContent>
          </HeaderRow>
        </ContentWithPaddingXl>
      </Container>
    );
  } else {
    return (
      <Container>
        <ContentWithPaddingXl>
          <HeaderRow>
            <Header>{heading}</Header>
            <TabsControl>
              {Object.keys(menus).map((tabName, index) => (
                <TabControl
                  key={index}
                  active={activeTab === tabName}
                  onClick={() => setActiveTab(tabName)}
                >
                  {tabName}
                </TabControl>
              ))}
            </TabsControl>
          </HeaderRow>

          {tabsKeys.map((tabKey, index) => (
            <TabContent
              key={index}
              variants={{
                current: {
                  opacity: 1,
                  scale: 1,
                  display: "flex",
                },
                hidden: {
                  opacity: 0,
                  scale: 0.8,
                  display: "none",
                },
              }}
              transition={{ duration: 0.4 }}
              initial={activeTab === tabKey ? "current" : "hidden"}
              animate={activeTab === tabKey ? "current" : "hidden"}
            >
              {menus[tabKey]?.map((card, index) => (
                <CardContainer key={index}>
                  <Card
                    className="group"
                    // href={card.url}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                  >
                    <CardImageContainer
                      imageSrc={
                        card.s3Urls ? card?.s3Urls?.[screenbrk] : card.imageUrl
                      }
                    >
                      <CardRatingContainer>
                        <CardRating>
                          <StarIcon />5
                        </CardRating>
                      </CardRatingContainer>
                      <CardHoverOverlay
                        variants={{
                          hover: {
                            opacity: 1,
                            height: "auto",
                          },
                          rest: {
                            opacity: 0,
                            height: 0,
                          },
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardButton
                          onClick={(e) => {
                            // e.preventDefault();
                            onBuyButtonClicked(card);
                          }}
                        >
                          Buy Now
                        </CardButton>
                      </CardHoverOverlay>
                    </CardImageContainer>

                    <CardText>
                      <CardTitle>{card.name}</CardTitle>
                      <CardContent>{card.description}</CardContent>
                      {/* full */}
                      {fullPriceComponent(card)}

                      {/* full end */}
                      {card.halfPrice > 0 && halfPriceComponent(card)}
                      {/* half */}
                    </CardText>

                    <PrimaryBuyButton
                      onClick={(e) => {
                        // e.preventDefault();
                        onBuyButtonClicked(card);
                      }}
                    >
                      Add To Cart
                    </PrimaryBuyButton>
                  </Card>
                </CardContainer>
              ))}
            </TabContent>
          ))}
        </ContentWithPaddingXl>
        <DecoratorBlob1 />
        <DecoratorBlob2 />
      </Container>
    );
  }
};
