import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export default function RootLayout({
children,
}:Readonly<{
children:React.ReactNode
}>) {


return (

<html lang="en">

<body className="bg-[#050816] text-white">


<Navbar/>

<main>
{children}
</main>


<Footer/>


</body>

</html>

)

}