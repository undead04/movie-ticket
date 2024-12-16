import axios from 'axios';
import crypto from 'crypto';
import { IMomoModel, ITransactionStatus } from '../Model/MomoModel';

export const createMoMoPayment = async (model: IMomoModel) => {
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint = process.env.MOMO_ENDPOINT;
    const redirectUrl = process.env.MOMO_REDIRECT_URL;
    const ipnUrl = process.env.MOMO_IPN_URL;

    if (!partnerCode || !accessKey || !secretKey || !endpoint || !redirectUrl || !ipnUrl) {
        throw new Error('Missing required environment variables for MoMo payment.');
    }

    const { orderCode, totalPrice, orderInfo } = model;
    if (!orderCode || !totalPrice || !orderInfo) {
        throw new Error('Invalid model data for MoMo payment.');
    }

    const requestId = orderCode;
    const rawSignature = `accessKey=${accessKey}&amount=${totalPrice}&extraData=&ipnUrl=${ipnUrl}&orderId=${requestId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');
   
    const payload = {
      "partnerCode": partnerCode,
      "partnerName" : "Test",
      "storeId" : "MoMoTestStore",
      "requestType": "payWithMethod",
      "ipnUrl": ipnUrl,
      "redirectUrl": redirectUrl,
      "orderId": requestId,
      "amount": totalPrice,
      "lang":  "vi",
      "orderInfo": orderInfo,
      "orderExpireTime" : 30,
      "requestId": requestId,
      "extraData": "",
      "signature": signature
    }
    

    console.log('Raw Signature:', rawSignature);
    console.log('Payload:', payload);

    try {
        const response = await axios.post(endpoint, payload);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            console.error('MoMo API Error:', error.response.data);
        } else if (error.request) {
            console.error('No response received from MoMo:', error.request);
        } else {
            console.error('Axios Error:', error.message);
        }
        throw new Error('Failed to create MoMo payment');
    }
};
export const transactionStatusOrder=async (model:ITransactionStatus)=>{
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const endpoint = process.env.MOMO_ENDPOINT_CHECK;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const rawSignature=`accessKey=${accessKey}&orderId=${model.orderCode}&partnerCode=${partnerCode}&requestId=${model.orderCode}`
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const payload={
      "partnerCode": partnerCode,
      "requestId": model.orderCode,
      "orderId": model.orderCode,
      "signature": signature,
      "lang": "vi"
  }
  
  try {
    const response = await axios.post(endpoint, payload);
    return response.data;
} catch (error: any) {
    if (error.response) {
        console.error('MoMo API Error:', error.response.data);
    } else if (error.request) {
        console.error('No response received from MoMo:', error.request);
    } else {
        console.error('Axios Error:', error.message);
    }
    throw new Error('Failed to create MoMo payment');
}

}