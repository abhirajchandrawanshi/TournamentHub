"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {forgotPasswordSchema}
from "@/lib/validations/auth.schema";

import {z}
from "zod";

import {authService}
from "@/services/auth.service";



type Data =
z.infer<typeof forgotPasswordSchema>;



export default function ForgotPasswordForm(){


const {
register,
handleSubmit
}=useForm<Data>({

resolver:
zodResolver(
forgotPasswordSchema
)

});



const submit=async(data:Data)=>{

await authService.forgotPassword(data);

alert("Reset link sent");

}



return (

<form
onSubmit={
handleSubmit(submit)
}
className="space-y-5"
>


<input

{...register("email")}

placeholder="Email"

className="
w-full
rounded-xl
bg-white/10
px-4
py-3
"

/>


<button

className="
w-full
bg-yellow-400
text-black
rounded-xl
py-3
font-bold
"

>

Send Reset Link

</button>


</form>

)

}