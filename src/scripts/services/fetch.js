import axios from 'axios';
import config from '../../config.public';
import { getLocalToken } from './session';

export const post = (url, data) => {
  const opt = {
    method: 'post',
    baseURL: config.api.url,
    url: url,
    headers: {
      Authorization: getLocalToken(),
      'Access-Control-Allow-Origin': 'PUT, DELETE, POST, GET',
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    data: data
  };

  return axios(opt).catch(error => {
    // Error
    if (error.response) {
      throw error.response.data.error;
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      throw error.request.statusText;
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error.message;
    }
  });
};

export const get = (url, data) => {
  const opt = {
    method: 'get',
    baseURL: config.api.url,
    url: url,
    headers: {
      Authorization: getLocalToken(),
      'Access-Control-Allow-Origin': 'PUT, DELETE, POST, GET',
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    data: data
  };

  return axios(opt).catch(error => {
    // Error
    if (error.response) {
      throw error;
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
      throw error;
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log(error.message);
      throw error;
    }
  });
};
