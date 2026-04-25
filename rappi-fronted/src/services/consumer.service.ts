import axios from "axios";
import type { Order, CreateOrderDTO } from "../types/orders.types";
import type { Store } from "../types/stores.types";
import type { Product } from "../types/products.types";

const API_URL = `${import.meta.env.VITE_API_URL}`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Obtener tiendas
export const getStores = async (): Promise<Store[]> => {
    const response = await axios.get(`${API_URL}/stores`, getAuthHeaders());
    return response.data;
};

export const getProductsByStore = async (storeid: string): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/products/stores/${storeid}`, getAuthHeaders());
    return response.data;
};

// Crear orden
export const createOrder = async (order: CreateOrderDTO): Promise<Order> => {
    const response = await axios.post(`${API_URL}/orders`, order, getAuthHeaders());
    return response.data;
};

// Órdenes del usuario
export const getUserOrders = async (userid: string): Promise<Order[]> => {
    const response = await axios.get(`${API_URL}/orders/user/${userid}`, getAuthHeaders());
    return response.data;
};
