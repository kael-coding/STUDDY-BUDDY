import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance.js";
import { adminApi } from "@/lib/superAdminApi.js";
import { installSessionRefresh } from "@/lib/sessionRefresh.js";
import { useAuthStore } from "@/store/authStore.js";

for (const client of [axios, axiosInstance, adminApi]) {
  installSessionRefresh(client, () => useAuthStore.getState().clearSession());
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
