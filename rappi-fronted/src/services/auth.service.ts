import axios from "axios";
import type { CreateUserDTO, AuthenticateUserDTO } from "../types/auth.types";

const API_URL = "https://rappi-lab-4.vercel.app/api";

export const register = async (userdata: CreateUserDTO) => {
    const response = await axios.post(`${API_URL}/auth/register`, userdata);
    return response.data;
};

export const login = async (credentials: AuthenticateUserDTO) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};
