import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const getHeaders = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
});

export const getAvailableOrders = async () => {
    const response = await axios.get(`${API_URL}/orders/available`, getHeaders());
    return response.data;
};

export const acceptOrder = async (orderid: string, deliveryid: string) => {
    const response = await axios.patch(
        `${API_URL}/orders/${orderid}/accept`,
        { deliveryid },
        getHeaders()
    );
    return response.data;
};

export const getAcceptedOrders = async (deliveryid: string) => {
    const response = await axios.get(`${API_URL}/orders/delivery/${deliveryid}`, getHeaders());
    return response.data;
};

export const updateOrderStatus = async (orderid: string, status: string) => {
    const response = await axios.patch(
        `${API_URL}/orders/${orderid}/status`,
        { status },
        getHeaders()
    );
    return response.data;
};
