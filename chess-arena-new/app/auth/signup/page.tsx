import SignupForm from "@/modules/auth/SignupForm";


export default function SignupPage(){

return (

<div className="
min-h-screen
flex
justify-center
items-center
bg-[#050816]
">


<div className="
max-w-md
w-full
bg-white/5
p-8
rounded-2xl
">


<h1 className="
text-3xl
font-bold
mb-6
">

Create Account

</h1>


<SignupForm/>


</div>


</div>

)

}