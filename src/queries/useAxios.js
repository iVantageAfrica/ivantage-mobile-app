import { useState, useEffect } from "react";
import axios from "axios";
import { MSStorage } from "../common/storage";
import { getDeviceId, getAppMantifest } from "../common/device";

// Todo: Update URLS with prod value
const urls = {
  //dev: "https://staging-api.imperialmortgagebank.com/mobile",
  //dev: "https://api-gateway.imperialmortgagebank.com/mobile",
  production: "https://api-gateway.imperialmortgagebank.com/mobile",
};

const env = process.env.APP_CONFIG || "production";

let clientEnv = env;
let baseUrl;

const createClient = (token, is_multi_part, deviceId) => {
  baseUrl = clientEnv === "dev" ? urls[clientEnv] : urls["production"];
  let headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    if (!is_multi_part) {
      headers = {
        "Content-Type": "application/json",
      };
    } else {
      headers = {
        "Content-Type": "multipart/form-data",
        "content-type": "multipart/form-data",
        Accept: "application/json",
      };
    }
    headers["Authorization"] = `Bearer ${token}`;
  }
  headers["App-Platform"] = "imperial_mobile_app";
  headers["App-Device-Signature"] = deviceId;
  headers["App-Version"] = getAppMantifest().version;
  const internalHttpClient = axios.create({
    baseURL: baseUrl,
    headers,
  });
  console.log("httpclient", baseUrl);
  return internalHttpClient;
};

const computeActivityTimeDiff = async (navigation) => {
  const lastRequestTime = await MSStorage.getItem("last_network_activity_time");
  if (!lastRequestTime) {
    await MSStorage.setItem("last_network_activity_time", new Date().getTime());
  }
  const currentTime = new Date().getTime();
  const idleTime = Math.ceil((currentTime - lastRequestTime) / 1000);
  if (idleTime > 180) {
    if (navigation) {
      await MSStorage.setItem("last_network_activity_time", null);
      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
      return;
    }
  }
  await MSStorage.setItem("last_network_activity_time", currentTime);
};

const useAxios = ({
  url,
  method,
  headers = null,
  stringify = true,
  is_multi_part = false,
  navigation = null,
}) => {
  const fetchData = async (body = null) => {
    await computeActivityTimeDiff(navigation);
    const token = await MSStorage.getItem("token");
    const deviceSignature = await getDeviceId();
    console.log("request url", url);
    return createClient(token, is_multi_part, deviceSignature)
      [method](url, stringify ? JSON.stringify(body) : body, headers)
      .catch((error) => {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message &&
          !error.response.data.success
        ) {
          return error.response.data.message;
        }
        if (error && error.toString().includes("AxiosError")) {
          return "Error: There was a network error and this request was not completed.";
        }
        if (error.response && error.response && error.response.data.exception) {
          return "Error: There was a network error and this request was not completed.";
        }
        return (
          error.response ||
          "Unable to process this request at this time. Please try again later."
        );
      });
  };

  return { fetchData };
};

export default useAxios;
