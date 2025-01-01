const axios = require("axios").default;
const { NBP_WEB_API } = require("../lib/constants");
const { createError } = require("./common");

const apiClient = axios.create({
  baseURL: NBP_WEB_API,
  timeout: 5000,
  headers: {
    Accept: "application/json",
  },
});

const getAllCurrenciesByTable = async (table = "a") => {
  try {
    const response = await apiClient.get(`/tables/${table}/?format=json`);
    return response.data[0];
  } catch (error) {
    throw new Error(`Failed to fetch currency rates: ${error.message}`);
  }
}

const getAllCurrencies = async () => {
  try {
    const [tableA, tableB] = await Promise.allSettled([getAllCurrenciesByTable("a"), getAllCurrenciesByTable("b")]);
    if(tableA.status === "rejected" && tableB.status === "rejected") {
      throw createError("NBP API tables are unavailable. Please try again later.", 503);
    }
    return [tableA, tableB];
  } catch (error) {
    throw createError(`Failed to fetch currency rates: ${error.message}`, 500);
  }
}

const getCurrencyRateByCode = async (table, code) => {
  try {
    const response = await apiClient.get(`/rates/${table}/${code}/?format=json`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch rate for ${code}: ${error.message}`);
  }
}

module.exports = {
  getAllCurrenciesByTable,
  getAllCurrencies,
  getCurrencyRateByCode,
};