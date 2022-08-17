import axios from "axios";

const fastapi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_FASTAPI,
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