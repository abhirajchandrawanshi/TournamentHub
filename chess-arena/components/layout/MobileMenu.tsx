"use client";


import Link from "next/link";
import { motion } from "framer-motion";


const links=[
{
name:"Home",
href:"/"
},
{
name:"Tournaments",
href:"/tournament"
},
{
name:"Leaderboard",
href:"/leaderboard"
},
{
name:"About",
href:"/about"
}
];


export default function MobileMenu({
close
}:{
close:()=>void
}){


return (

<motion.div
initial={{
opacity:0,
y:-20
}}
animate={{
opacity:1,
y:0
}}

className="
md:hidden
absolute
top-20
left-0
right-0
bg-[#050816]
border-t
border-white/10
"
>


<div className="flex flex-col p-6 gap-5">


{
links.map((item)=>(

<Link
key={item.href}
href={item.href}
onClick={close}
className="
text-gray-300
hover:text-yellow-400
transition
"
>

{item.name}

</Link>

))
}



<Link

href="/auth/login"

className="
bg-yellow-400
text-black
text-center
rounded-xl
py-3
font-semibold
"

>

Login

</Link>


</div>


</motion.div>


)


}