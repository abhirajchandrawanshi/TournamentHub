import LoginForm from "@/modules/auth/LoginForm";
import GoogleLoginButton from "@/modules/auth/GoogleLoginButton";


export default function LoginPage(){


return (

<div className="
min-h-screen
flex
items-center
justify-center
bg-[#050816]
">


<div className="
w-full
max-w-md
bg-white/5
p-8
rounded-2xl
">


<h1 className="
text-3xl
font-bold
mb-6
">

Welcome Back

</h1>


<LoginForm/>

<div className="my-5"/>

<GoogleLoginButton/>


</div>


</div>

)

}