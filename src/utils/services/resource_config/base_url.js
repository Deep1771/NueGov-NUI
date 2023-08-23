/*
! CAREFUL WITH BASE_URL 
TODO : DRIVE BASE_URL THROUGH ENVIRONMENT
*/

export const BASE_URL = process.env.REACT_APP_BASE_URL;
// export const BASE_URL = "https://proxy-staging.assetgov-dev.com";

/* 
! ADD ALL MICROSERVICE END POINTS HERE
? Follow Alphabetic order
*/
export const API_URL = `${BASE_URL}`;
export const AUTH_URL = `${BASE_URL}/api/auth`;
export const BULKACTIONS_URL = `${BASE_URL}/bulkaction`;
export const CLUSTERER_URL = `${BASE_URL}/clusterer`;
export const DELETE_URL = `${BASE_URL}/api/delete-entity`;
export const EXPORT_URL = `${BASE_URL}/export`;
export const IMPORT_URL = `${BASE_URL}/import`;
export const LIVESTREAM_URL = `${BASE_URL}/livestream`;
export const NAPI_URL = `${BASE_URL}/napi/`;
export const REPORT_URL = `http://localhost:3002/report`;
