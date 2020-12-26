import React, { useEffect, useState } from "react";
import {
  Button,
  Center,
  useToast,
  Spinner,
  VStack,
  Box,
  SimpleGrid,
  Stack,
  Badge,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ReactDependentScript from "react-dependent-script";
import config from "../../../config";
import { useHistory } from "react-router-dom";
import { authAxios } from "utils/Auth";
import { getMemberDetails } from "utils/Authz";
import date from "date-and-time";

const datePattern = date.compile("ddd, MMM DD YYYY");
const MemberPayment = () => {
  const [reqBodyBolt, setReqBodyBolt] = useState({});
  const [isPayButtonActive, setPayButtonActive] = useState(false);
  const [paymentDataArrayState, setPaymentDataArrayState] = useState({});
  const history = useHistory();
  const toast = useToast();

  useEffect(() => {
    fetchPaymentDetails();
    authAxios()
      .post(`/api/payments/hash/generate/${getMemberDetails().memberId}`, {})
      .then((response) => {
        setReqBodyBolt({
          ...response.data,
        });
      });
  }, []);

  useEffect(() => {
    setPayButtonActive(true);
  }, [reqBodyBolt]);

  const contactServer = () => {
    authAxios()
      .post("/api/payments/hash/verify", reqBodyBolt)
      .then((result) => {
        if (result.status === 200) {
          history.push("/member/status/success?status=success");
        } else {
          toast({
            title: "Transaction authentication failed",
            description: "Invalid transaction",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((err) => {
        console.log("Error occured while contacting server", err);
        throw new Error("Error occured while contacting server");
      });
  };

  const fetchPaymentDetails = async () => {
    const paymentDetails = await authAxios().get(
      `/api/members/payment/${getMemberDetails().memberId}`
    );
    setPaymentDataArrayState(paymentDetails.data.data);
    // var myDate = new Date("2021-01-01T07:00:00.000Z");
    // let formattedDate = date.format(myDate, datePattern);
  };

  function launchBolt() {
    window.bolt.launch(reqBodyBolt, {
      responseHandler: function (BOLT) {
        if (BOLT.response.txnStatus === "SUCCESS") {
          contactServer();
        } else if (BOLT.response.txnStatus === "CANCEL") {
          toast({
            title: "User cancelled transaction",
            description: "User cancelled transaction.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Transaction failed",
            description: "Please try again",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      },
      catchException: function (BOLT) {
        alert(BOLT.message);
      },
    });
  }

  const paymentDataArray = [
    {
      index: 1,
      link: "#",
      textContent: "January 2021",
      paidStatus: "PAID",
      colorScheme: "green",
    },
    {
      index: 2,
      link: "#",
      textContent: "February 2021",
      paidStatus: "PAID",
      colorScheme: "green",
    },
    {
      index: 3,
      link: "#",
      textContent: "March 2021",
      paidStatus: "PAID",
      colorScheme: "green",
    },
    {
      index: 4,
      link: "#",
      textContent: "April 2021",
      paidStatus: "OVERDUE",
      colorScheme: "red",
    },
    {
      index: 5,
      link: "#",
      textContent: "May 2021",
      paidStatus: "OVERDUE",
      colorScheme: "red",
    },
    {
      index: 6,
      link: "#",
      textContent: "June 2021",
      paidStatus: "DUE",
      colorScheme: "orange",
    },
  ];

  return (
    <ReactDependentScript
      loadingComponent={
        <VStack>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="teal.500"
            size="xl"
          />
          Payment page is loading...
        </VStack>
      }
      scripts={["https://checkout-static.citruspay.com/bolt/run/bolt.min.js"]}
    >
      {/* <Center h="80vh">
        <Heading>Due amount is Rs 300</Heading>
        <Button onClick={() => launchBolt()}> Pay</Button>
      </Center> */}
      <Box h={{ base: "100%", md: "80vh" }} m={8}>
        <Stack w="80%" m="auto" spacing={8}>
          <Box>
            <Badge borderRadius={10} colorScheme="orange" p={2}>
              Due for
            </Badge>
          </Box>
          <SimpleGrid minChildWidth="260px" spacing="40px">
            <SimpleCard
              link="#"
              textContent={date.format(
                new Date(paymentDataArrayState.dueFor),
                datePattern
              )}
              paidStatus="DUE"
              colorScheme="orange"
              launchBolt={launchBolt}
              isPayButtonActive={isPayButtonActive}
            />
          </SimpleGrid>

          <Box>
            <Badge borderRadius={10} colorScheme="red" p={2}>
              Overdue for
            </Badge>
          </Box>
          <SimpleGrid minChildWidth="260px" spacing="40px">
            <SimpleCard
              link="#"
              textContent={date.format(
                new Date(paymentDataArrayState.dueFor),
                datePattern
              )}
              paidStatus="DUE"
              colorScheme="orange"
              launchBolt={launchBolt}
              isPayButtonActive={isPayButtonActive}
            />
            <SimpleCard
              link="#"
              textContent={date.format(
                new Date(paymentDataArrayState.dueFor),
                datePattern
              )}
              paidStatus="DUE"
              colorScheme="orange"
              launchBolt={launchBolt}
              isPayButtonActive={isPayButtonActive}
            />
            <SimpleCard
              link="#"
              textContent={date.format(
                new Date(paymentDataArrayState.dueFor),
                datePattern
              )}
              paidStatus="DUE"
              colorScheme="orange"
              launchBolt={launchBolt}
              isPayButtonActive={isPayButtonActive}
            />
          </SimpleGrid>
          <Box>
            <Badge borderRadius={10} colorScheme="green" p={2}>
              Previous Transactions
            </Badge>
          </Box>
          <SimpleGrid column={2} minChildWidth="260px" spacing="40px">
            {paymentDataArray.map((card) => (
              <SimpleCard
                key={card.index}
                link={card.link}
                textContent={card.textContent}
                paidStatus={card.paidStatus}
                colorScheme={card.colorScheme}
                launchBolt={launchBolt}
                isPayButtonActive={isPayButtonActive}
              />
            ))}
          </SimpleGrid>
        </Stack>
      </Box>
    </ReactDependentScript>
  );
};

const SimpleCard = ({
  link,
  textContent,
  paidStatus,
  colorScheme,
  launchBolt,
  isPayButtonActive,
}) => (
  <Link to={link}>
    <Center
      shadow="xl"
      borderRadius="20px"
      h="200px"
      p={8}
      bg="gray.100"
      _hover={{
        border: "2px solid",
        borderColor: "teal.300",
      }}
    >
      <Stack
        direction={{ base: "column", md: "column" }}
        justify="center"
        align="center"
        spacing={4}
      >
        <Text align="center" fontSize={{ base: "xl", md: "2xl" }}>
          {textContent}
        </Text>
        <Badge borderRadius={5} colorScheme={colorScheme}>
          {paidStatus}
        </Badge>
        {paidStatus.includes("DUE") ? (
          <Button
            isDisabled={!isPayButtonActive}
            onClick={() => launchBolt()}
            colorScheme="teal"
          >
            Pay Now
          </Button>
        ) : (
          <></>
        )}
      </Stack>
    </Center>
  </Link>
);

export default MemberPayment;
