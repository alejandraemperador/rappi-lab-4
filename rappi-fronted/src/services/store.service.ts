import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}`;

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getMyStore = async (userid: string) => {
    const response = await axios.get(`${API_URL}/stores/user/${userid}`, getAuthHeaders());
    return response.data;
};

export const toggleStoreStatus = async (storeid: string, isopen: boolean) => {
    const response = await axios.patch(
        `${API_URL}/stores/${storeid}/status`,
        { isopen },
        getAuthHeaders()
    );
    return response.data;
};

export const createProduct = async (productdata: any) => {
    const dataToSend = {
        name: productdata.name,
        description: productdata.description,
        price: Number(productdata.price),
        imageurl: productdata.imageurl,
        storeid: productdata.storeid
    };

    const response = await axios.post(`${API_URL}/products`, dataToSend, getAuthHeaders());
    return response.data;
};

export const deleteProduct = async (productid: string) => {
    const response = await axios.delete(`${API_URL}/products/${productid}`, getAuthHeaders());
    return response.data;
};
