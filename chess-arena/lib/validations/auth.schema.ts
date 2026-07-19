import {z} from "zod";


export const loginSchema =
z.object({

email:
z.string()
.email("Invalid email"),


password:
z.string()
.min(6,"Password must be 6 characters")

});



export const signupSchema =
z.object({

name:
z.string()
.min(2,"Name required"),


email:
z.string()
.email("Invalid email"),


password:
z.string()
.min(6,"Password minimum 6 characters")

});



export const forgotPasswordSchema =
z.object({

email:
z.string()
.email("Invalid email")

});