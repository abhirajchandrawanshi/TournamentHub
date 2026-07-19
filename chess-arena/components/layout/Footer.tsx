import Container from "@/components/ui/Container";


export default function Footer(){

return(

<footer
className="
border-t
border-white/10
bg-[#050816]
py-10
text-gray-400
"
>


<Container>

<div className="
flex
flex-col
md:flex-row
justify-between
gap-5
">


<div>

<h2 className="
text-xl
font-bold
text-white
">

ChessArena

</h2>

<p className="mt-2 text-sm">

The ultimate platform for competitive chess tournaments.

</p>

</div>



<div className="text-sm">

© {new Date().getFullYear()} ChessArena. All rights reserved.

</div>


</div>


</Container>


</footer>


)


}