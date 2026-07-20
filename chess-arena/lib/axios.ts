import axios from "axios";
import { auth } from "./firebase";


const api = axios.create({

  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api",

  headers:{
    "Content-Type":"application/json",
  },

});



api.interceptors.request.use(
async (config)=>{

const user = auth.currentUser;
if(user && config.headers){
  try {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error("Error getting Firebase ID token:", error);
  }
}


return config;

},
(error)=>Promise.reject(error)

);



export default api;