import { getAllMenusApi } from "API/menu.api";
import { getAllOffersApi } from "API/offers.api";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons";
import { SectionHeading } from "components/misc/Headings";
import { ReactComponent as ChevronLeftIcon } from "feather-icons/dist/icons/chevron-left.svg";
import { ReactComponent as ChevronRightIcon } from "feather-icons/dist/icons/chevron-right.svg";
import { ReactComponent as PriceIcon } from "feather-icons/dist/icons/dollar-sign.svg";
// import { ReactComponent as LocationIcon } from "feather-icons/dist/icons/map-pin.svg";
// import { ReactComponent as StarIcon } from "feather-icons/dist/icons/star.svg";
import RestaurantMenuIcon from "@material-ui/icons/RestaurantMenu";
import MoneyOffIcon from "@material-ui/icons/MoneyOff";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import styled from "styled-components";
import tw from "twin.macro";
import {
  getLocalStorageProperty,
  setLocalStorageProperty,
} from "util/LocalStorageHelper";
import { getToast } from "util/ToastHelper";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

const Container = tw.div`relative`;
const Content = tw.div`max-w-screen-xl mx-auto py-16 lg:py-20`;

const HeadingWithControl = tw.div`flex flex-col items-center sm:items-stretch sm:flex-row justify-between`;
const Heading = tw(SectionHeading)``;
const Controls = tw.div`flex items-center`;
const ControlButton = styled(PrimaryButtonBase)`
  ${tw`mt-4 sm:mt-0 first:ml-0 ml-6 rounded-full p-2`}
  svg {
    ${tw`w-6 h-6`}
  }
`;
const PrevButton = tw(ControlButton)``;
const NextButton = tw(ControlButton)``;

const CardSlider = styled(Slider)`
  ${tw`mt-16`}
  .slick-track {
    ${tw`flex`}
  }
  .slick-slide {
    ${tw`h-auto flex justify-center mb-1`}
  }
`;
const Card = tw.div`h-full flex! flex-col sm:border max-w-sm sm:rounded-tl-4xl sm:rounded-br-5xl relative focus:outline-none`;
const CardImage = styled.div((props) => [
  `background-image: url("${props.imageSrc}");`,
  tw`w-full h-56 sm:h-64 bg-cover bg-center rounded sm:rounded-none sm:rounded-tl-4xl`,
]);

const TextInfo = tw.div`py-6 sm:px-10 sm:py-6`;
const TitleReviewContainer = tw.div`flex flex-col sm:flex-row sm:justify-between sm:items-center`;
const Title = tw.h5`text-2xl font-bold`;

// const RatingsInfo = styled.div`
//   ${tw`flex items-center sm:ml-4 mt-2 sm:mt-0`}
//   svg {
//     ${tw`w-6 h-6 text-yellow-500 fill-current`}
//   }
// `;
const Rating = tw.span`ml-2 font-bold`;

const Description = tw.p`text-sm leading-loose mt-2 sm:mt-4`;

const SecondaryInfoContainer = tw.div`flex flex-col sm:flex-row mt-2 sm:mt-4`;
const IconWithText = tw.div`flex items-center mr-6 my-2 sm:my-0`;
const IconContainer = styled.div`
  ${tw`inline-block rounded-full p-2 bg-gray-700 text-gray-100`}
  svg {
    ${tw`w-3 h-3`}
  }
`;
const Text = tw.div`ml-2 text-sm font-semibold text-gray-800`;

const PrimaryButton = tw(
  PrimaryButtonBase
)`mt-auto sm:text-lg rounded-none w-full rounded sm:rounded-none sm:rounded-br-4xl py-3 sm:py-6`;
export default ({ reloadPage, setReloadPage }) => {
  // useState is used instead of useRef below because we want to re-render when sliderRef becomes available (not null)
  const [sliderRef, setSliderRef] = useState(null);
  const [offers, setOffers] = useState([]);
  const [menusHashMap, setMenusHashMap] = useState("");
  const [screenbrk, setScreenbrk] = useState("");
  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  };
  const [isLoading, setIsLoading] = useState(true);
  const onBuyButtonClicked = (menu, offer) => {
    //calculate discount or free Menus
    let discountCalc = 0;
    let freeMenuCalc = {};

    let price_ =
      offer.portionThresh === "half" && menu.halfPrice > 0
        ? menu.halfPrice
        : menu.price;

    if (offer?.type === "discount" || offer?.type === "percentage") {
      discountCalc = offer?.discount;
    } else {
      discountCalc = 0;
      freeMenuCalc = {
        menu: offer.freeMenu.menu,
        name: offer.freeMenu.name,
        quantity: offer.freeMenu.quantity,
        portion: offer.freeMenu?.portion,
      };
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
          purchasedQty: offer.quantityThresh,
          payablePrice: price_ * offer.quantityThresh - discountCalc,
          discount: discountCalc,
          freeMenu: freeMenuCalc,
          portion: offer.portionThresh,
          isHalf: menu.isHalf,
          halfPrice: menu.halfPrice,
        },
      };
    } else {
      cart = {
        [menu._id]: {
          menuId: menu._id,
          name: menu.name,
          price: menu.price,
          purchasedQty: offer.quantityThresh,
          payablePrice: price_ * offer.quantityThresh - discountCalc,
          discount: discountCalc,
          freeMenu: freeMenuCalc,
          portion: offer.portionThresh,
          isHalf: menu.isHalf,
          halfPrice: menu.halfPrice,
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

  const sliderSettings = {
    arrows: false,
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
        },
      },

      {
        breakpoint: 900,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };
  const fetchOffers = async () => {
    try {
      let offersResponse = await getAllOffersApi();
      if (offersResponse.length === 2) {
        offersResponse = [...offersResponse, offersResponse[0]];
      }
      if (offersResponse.length === 1) {
        offersResponse = [
          ...offersResponse,
          offersResponse[0],
          offersResponse[0],
        ];
      }

      setOffers(offersResponse);
    } catch (error) {
      setOffers([]);
    }
  };
  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      let menuList = await getAllMenusApi();
      const menusHash = menuList.reduce(
        (acc, cur) => ({
          ...acc,
          [cur._id]: {
            _id: cur._id,
            name: cur.name,
            price: cur.price,
            discount: cur?.offer?.isOfferAvailable ? cur.offer.discount : 0,
            offer: cur?.offer?.isOfferAvailable ? cur.offer : null,
            ...cur,
          },
        }),
        {}
      );

      setMenusHashMap(menusHash);
    } catch (error) {
      setMenusHashMap({});
    }
    setIsLoading(false);
  };
  const priceComponenet = (card) => {
    let price_ =
      card.portionThresh === "half"
        ? menusHashMap?.[card?.menu]?.halfPrice
        : menusHashMap?.[card?.menu]?.price;
    return card?.type === "discount" || card?.type === "percentage" ? (
      <IconWithText>
        <IconContainer>
          <PriceIcon />
        </IconContainer>
        <Text
          style={{
            textDecorationLine: "line-through",
            WebkitTextDecorationLine: "line-through",
            textDecorationColor: "red",
            WebkitTextDecorationColor: "red",
            textDecorationThickness: "1px",
            WebkitTextDecorationStyle: "solid",
          }}
        >
          RS.
          {price_ * card?.quantityThresh}
        </Text>
        <Text>
          RS.
          {price_ * card?.quantityThresh - card?.discount}
        </Text>
      </IconWithText>
    ) : (
      <IconWithText>
        <IconContainer>
          <PriceIcon />
        </IconContainer>
        <Text>
          RS.
          {price_ * card?.quantityThresh}
        </Text>
      </IconWithText>
    );
  };
  useEffect(() => {
    const { width, height } = getWindowDimensions();
    //set Screen break point
    let brkPoint = width > 800 ? "lg" : width > 450 ? "md" : "sm";
    setScreenbrk(brkPoint);

    fetchOffers();
    fetchMenus();
  }, []);

  if (isLoading) {
    return (
      <Container>
        <Content>
          <HeadingWithControl>
            <Heading>Cyber Offers</Heading>
          </HeadingWithControl>
          <CardSlider ref={setSliderRef} {...sliderSettings}>
            <Loader type="Puff" color="#00BFFF" height={100} width={100} />
          </CardSlider>
        </Content>
      </Container>
    );
  } else {
    return (
      <Container>
        <Content>
          <HeadingWithControl>
            <Heading>Cyber Offers</Heading>
            <Controls>
              <PrevButton onClick={sliderRef?.slickPrev}>
                <ChevronLeftIcon />
              </PrevButton>
              <NextButton onClick={sliderRef?.slickNext}>
                <ChevronRightIcon />
              </NextButton>
            </Controls>
          </HeadingWithControl>
          <CardSlider ref={setSliderRef} {...sliderSettings}>
            {offers.map((card, index) => (
              <Card key={index}>
                <CardImage
                  imageSrc={
                    card?.s3Urls ? card?.s3Urls?.[screenbrk] : card?.imageUrl
                  }
                />
                <TextInfo>
                  <TitleReviewContainer>
                    <Title>{card?.name}</Title>
                  </TitleReviewContainer>
                  <SecondaryInfoContainer>
                    <IconWithText>
                      <IconContainer>
                        <RestaurantMenuIcon />
                      </IconContainer>
                      <Text>{menusHashMap?.[card?.menu]?.name}</Text>
                    </IconWithText>
                    {/* price */}
                    {priceComponenet(card)}
                  </SecondaryInfoContainer>
                  <IconWithText>
                    <IconContainer>
                      <MoneyOffIcon />
                    </IconContainer>
                    {card?.type === "discount" ? (
                      <Rating>{`Buy ${card?.quantityThresh} ${
                        card?.portionThresh
                      } ${menusHashMap?.[card?.menu]?.name} And SAVE RS.${
                        card?.discount
                      }`}</Rating>
                    ) : card.type === "percentage" ? (
                      <Rating>{`Buy ${card?.quantityThresh} ${
                        card?.portionThresh
                      } ${menusHashMap?.[card?.menu]?.name} And GET ${
                        card?.percentage
                      } % OFF`}</Rating>
                    ) : (
                      card?.type === "freeMenu" && (
                        <Rating>
                          {` Buy ${card?.quantityThresh}  ${
                            card?.portionThresh
                          } ${menusHashMap?.[card?.menu]?.name} And Get
                          ${card?.freeMenu?.quantity} ${
                            card?.freeMenu?.name
                          } FREE`}
                        </Rating>
                      )
                    )}
                  </IconWithText>
                  <Description>{card.description}</Description>
                </TextInfo>
                <PrimaryButton
                  onClick={() => {
                    onBuyButtonClicked(menusHashMap?.[card?.menu], card);
                  }}
                >
                  Add To Cart
                </PrimaryButton>
              </Card>
            ))}
          </CardSlider>
        </Content>
      </Container>
    );
  }
};
