"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {loginSchema} from "@/lib/validations/auth.schema";
import {z} from "zod";
import {authService} from "@/services/auth.service";
import {useAuthStore} from "@/store/auth.store";
import {useRouter} from "next/navigation";


type LoginData =
z.infer<typeof loginSchema>;



export default function LoginForm(){


const router = useRouter();

const setAuth =
useAuthStore(
(state)=>state.setAuth
);



const {
register,
handleSubmit,
formState:{
errors
}
}=useForm<LoginData>({

resolver:zodResolver(loginSchema)

});




const onSubmit = async(data:LoginData)=>{


try{


const response =
await authService.login(data);


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
onSubmit={
handleSubmit(onSubmit)
}
className="
space-y-5
"
>


<input

{...register("email")}

placeholder="Email"

className="
w-full
rounded-xl
bg-white/10
border
border-white/10
px-4
py-3
outline-none
"

/>


<p className="text-red-400 text-sm">

{errors.email?.message}

</p>




<input

type="password"

{...register("password")}

placeholder="Password"

className="
w-full
rounded-xl
bg-white/10
border
border-white/10
px-4
py-3
outline-none
"

/>


<p className="text-red-400 text-sm">

{errors.password?.message}

</p>



<button

className="
w-full
rounded-xl
bg-yellow-400
py-3
font-semibold
text-black
hover:bg-yellow-300
transition
"

>

Login

</button>



</form>

)

}