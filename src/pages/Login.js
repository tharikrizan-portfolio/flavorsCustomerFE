import React, { useState } from "react";
import AnimationRevealPage from "helpers/AnimationRevealPage.js";
import { Container as ContainerBase } from "components/misc/Layouts";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import illustration from "images/login-illustration.svg";
import logo from "../images/flavors-logo.jpg";
import { ReactComponent as LoginIcon } from "feather-icons/dist/icons/log-in.svg";
import { getToast } from "util/ToastHelper";
import { login, sendOTP, spammerCount, verifyOtp } from "API/loginOut.api";
import { getLocalStorageProperty } from "util/LocalStorageHelper";
import { useHistory } from "react-router-dom";

const Container = tw(
  ContainerBase
)`min-h-full bg-primary-900 text-white font-medium flex justify-center -m-10 mt-4`;
const Content = tw.div`max-w-screen-xl m-0 sm:mx-20 sm:my-16 bg-white text-gray-900 shadow sm:rounded-lg flex justify-center flex-1`;
const MainContainer = tw.div`lg:w-1/2 xl:w-5/12 p-6 sm:p-12`;
const LogoLink = tw.a``;
const LogoImage = tw.img`h-12 mx-auto`;
const MainContent = tw.div`mt-12 flex flex-col items-center`;
const Heading = tw.h1`text-2xl xl:text-3xl font-extrabold`;
const FormContainer = tw.div`w-full flex-1 mt-8`;

const DividerTextContainer = tw.div`mb-12 mt-6 border-b text-center relative`;
const DividerText = tw.div`leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform -translate-y-1/2 absolute inset-x-0 top-1/2 bg-transparent`;

const Form = tw.form`mx-auto max-w-xs`;
const Input = tw.input`w-full px-8 py-4 mb-6 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5 first:mt-0`;
const SubmitButton = styled.button`
  ${tw`mt-5 tracking-wide font-semibold bg-primary-500 text-gray-100 w-full py-4 rounded-lg hover:bg-primary-900 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none`}
  .icon {
    ${tw`w-6 h-6 -ml-2`}
  }
  .text {
    ${tw`ml-3`}
  }
`;
const IllustrationContainer = tw.div`sm:rounded-r-lg flex-1 bg-purple-100 text-center hidden lg:flex justify-center`;
const IllustrationImage = styled.div`
  ${(props) => `background-image: url("${props.imageSrc}");`}
  ${tw`m-12 xl:m-16 w-full max-w-sm bg-contain bg-center bg-no-repeat`}
`;

function Login() {
  const logoLinkUrl = "#";
  const illustrationImageSrc = illustration;
  const headingText = "Sign In To Flavors";
  const submitButtonText = "Send OTP";
  const [dividerText, setDividerText] = useState(
    "Sign in with a valid phone number"
  );
  const [confirmOtp, setConfirmOtp] = useState(false);
  const [error, setError] = useState(false);
  const SubmitButtonIcon = LoginIcon;
  const history = useHistory();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [modifiedPhoneNumber, setModifiedPhoneNumber] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const verifyId = getLocalStorageProperty("flavors-verifyId");
  const onChangeValues = (event) => {
    event.preventDefault();
    const field = event.target.name;
    const value = event.target?.value?.trim();

    if (field === "phoneNumber") {
      setPhoneNumber(value);
      if (!value) {
        // empty field
        setError(true);
        setDividerText("Please enter your mobile number");
      } else if (value.length !== 10) {
        // length is less than 10 digits
        setError(true);
        setDividerText("Length should be 10");
      } else {
        var patt = new RegExp("[^0-9]");
        if (patt.test(value)) {
          // contains special chars
          setError(true);
          setDividerText("Please enter only digits");
        } else if (value.substring(0, 2) !== "07") {
          // if not a mobile number
          setError(true);
          setDividerText("First two digits should be 07  (07x xxxx xxx)");
        } else {
          setModifiedPhoneNumber(`${94}${value.substring(1)}`);
          setError(false);
        }
      }
    } else {
      setVerifyCode(value);
      // empty field
      if (!value) {
        setError(true);
        setDividerText("Please enter otp receivd to your number");
      } else if (value.length !== 4) {
        // length is less than 4 digits
        setError(true);
        setDividerText("Length should be 4");
      } else {
        let patt = new RegExp("[^0-9]");
        if (patt.test(value)) {
          // contains special chars
          setError(true);
          setDividerText("Please enter only digits");
        } else {
          setError(false);
        }
      }
    }
  };
  const onSubmitClicked = async (event) => {
    event.preventDefault();
    try {
      if (error) {
        getToast(false, "Errors Found !");
        return;
      }
      if (confirmOtp) {
        // verify otp
        const verificationStatus = await verifyOtp({
          verifyCode,
          phoneNumber: modifiedPhoneNumber,
          verifyId,
        });

        // if valid -> route to home
        if (verificationStatus) {
          //now login the user
          const loginStatus = await login({ phoneNumber: modifiedPhoneNumber });
          if (loginStatus) {
            history.push("/cart");
          }
        } else {
          // if invalid
          await spammerCount({ phoneNumber: modifiedPhoneNumber });
        }
      } else {
        // valid mobile number - call sms api
        const verifyId = await sendOTP({ phoneNumber: modifiedPhoneNumber });
        if (verifyId) {
          // render confirm otp field
          setConfirmOtp(true);
          setDividerText("Enter the OTP recieved");
        }
      }
    } catch (error) {
      return;
    }
  };

  return (
    <AnimationRevealPage>
      <Container>
        <Content>
          <MainContainer>
            <LogoLink href={logoLinkUrl}>
              <LogoImage src={logo} />
            </LogoLink>
            <MainContent>
              <Heading>{headingText}</Heading>
              <FormContainer>
                <DividerTextContainer>
                  <DividerText style={{ color: error ? "red" : "" }}>
                    {dividerText}
                  </DividerText>
                </DividerTextContainer>
                <Form onSubmit={onSubmitClicked}>
                  {!confirmOtp && (
                    <Input
                      name="phoneNumber"
                      id="phoneNumber"
                      placeholder="07xxxxxxxxx"
                      value={phoneNumber}
                      onChange={onChangeValues}
                      maxLength="10"
                    />
                  )}
                  {confirmOtp && (
                    <Input
                      name="OTP"
                      placeholder="OTP"
                      onChange={onChangeValues}
                      value={verifyCode}
                      maxLength="4"
                    />
                  )}
                  <SubmitButton type="submit">
                    <SubmitButtonIcon className="icon" />
                    <span className="text">{submitButtonText}</span>
                  </SubmitButton>
                </Form>
              </FormContainer>
            </MainContent>
          </MainContainer>
          <IllustrationContainer>
            <IllustrationImage imageSrc={illustrationImageSrc} />
          </IllustrationContainer>
        </Content>
      </Container>
    </AnimationRevealPage>
  );
}

export default Login;
