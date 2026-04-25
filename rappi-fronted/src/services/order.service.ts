import axios from "axios";
import type { Order, CreateOrderDTO } from "../types/orders.types";
import type { Store } from "../types/stores.types";
import type { Product } from "../types/products.types";

const API_URL = `${import.meta.env.VITE_API_URL}`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error("No hay token, el usuario no está autenticado");
    }

    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};


export const getStores = async (): Promise<Store[]> => {
    try {
        const response = await axios.get(`${API_URL}/stores`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error obteniendo tiendas:", error);
        throw error;
    }
};


export const getProductsByStore = async (storeid: string): Promise<Product[]> => {
    try {
        const response = await axios.get(
            `${API_URL}/products/stores/${storeid}`,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        throw error;
    }
};

export const createOrder = async (order: CreateOrderDTO): Promise<Order> => {
    try {
        const response = await axios.post(
            `${API_URL}/orders`,
            order,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error("Error creando orden:", error);
        throw error;
    }
};

export const getUserOrders = async (userid: string): Promise<Order[]> => {
    try {
        if (!userid) {
            throw new Error("userid es undefined");
        }

        const response = await axios.get(
            `${API_URL}/orders/user/${userid}`,
            getAuthHeaders()
        );

        return response.data;
    } catch (error) {
        console.error("Error obteniendo órdenes del usuario:", error);
        throw error;
    }
};


export const getStoreOrders = async (storeid: string): Promise<any> => {
    try {
        if (!storeid) {
            throw new Error("storeid es undefined");
        }

        const response = await axios.get(
            `${API_URL}/orders/store/${storeid}`,
            getAuthHeaders()
        );

        return response.data;
    } catch (error) {
        console.error("Error obteniendo órdenes de la tienda:", error);
        throw error;
    }
};
