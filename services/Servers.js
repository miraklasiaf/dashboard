import axios from "axios";

const fastapi = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
      "Content-type": "application/json",
    },
  });

const flowerapi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_FLOWERAPI,
    headers: {
      "Content-type": "application/json",
    },
  });

  export default {
    fastapi,
    flowerapi,
  };

 