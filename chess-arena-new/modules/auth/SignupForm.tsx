"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {authService} from "@/services/auth.service";
import {useAuthStore} from "@/store/auth.store";
import {useRouter} from "next/navigation";


const signupSchema = z.object({
name: z.string().min(1, "Name is required"),
email: z.string().email("Invalid email"),
password: z.string().min(6, "Password must be at least 6 characters"),
});


type SignupData =
z.infer<typeof signupSchema>;



export default function SignupForm(){


const router=useRouter();

const setAuth =
useAuthStore(
state=>state.setAuth
);



const {
register,
handleSubmit,
formState:{
errors
}

}=useForm<SignupData>({

resolver:zodResolver(signupSchema)

});



const submit=async(data:SignupData)=>{


try{

const response =
await authService.signup(data);


setAuth(
response.user,
response.token
);


router.push("/dashboard");


}

catch(error){

console.log(error);

}


}



return (

<form
onSubmit={handleSubmit(submit)}
className="space-y-5"
>


<input
{...register("name")}
placeholder="Full Name"
className="
input-style
"
/>


<input
{...register("email")}
placeholder="Email"
className="
input-style
"
/>


<input
type="password"
{...register("password")}
placeholder="Password"
className="
input-style
"/>


<button
className="
w-full
rounded-xl
bg-yellow-400
py-3
text-black
font-bold
"
>

Create Account

</button>


</form>

)

}