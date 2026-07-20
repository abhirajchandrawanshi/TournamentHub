"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Container from "@/components/ui/Container";
import MobileMenu from "./MobileMenu";


const navItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Tournaments",
    href: "/tournament",
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
  },
  {
    name: "About",
    href: "/about",
  },
];


export default function Navbar() {

  const pathname = usePathname();

  const [open,setOpen] = useState(false);
  const [scroll,setScroll] = useState(false);


  useEffect(()=>{

    const handleScroll=()=>{
      setScroll(window.scrollY > 20);
    };

    window.addEventListener("scroll",handleScroll);

    return ()=>window.removeEventListener("scroll",handleScroll);

  },[]);



  return (

    <header
      className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${
        scroll
        ? "bg-[#050816]/90 backdrop-blur-md shadow-lg"
        : "bg-transparent"
      }
      `}
    >

      <Container>

        <div className="flex h-20 items-center justify-between">


          {/* Logo */}

          <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-white"
          >

            <Trophy 
            className="text-yellow-400"
            size={28}
            />

            ChessArena

          </Link>



          {/* Desktop Menu */}

          <nav className="hidden md:flex items-center gap-8">

            {
              navItems.map((item)=>{

                const active =
                pathname === item.href;


                return (

                  <Link
                  key={item.href}
                  href={item.href}
                  className={`
                  relative text-sm font-medium transition
                  ${
                    active
                    ? "text-yellow-400"
                    : "text-gray-300 hover:text-white"
                  }
                  `}
                  >

                    {item.name}


                    {
                      active && (

                        <motion.span
                        layoutId="active"
                        className="
                        absolute -bottom-2
                        left-0 right-0
                        h-[2px]
                        bg-yellow-400
                        "
                        />

                      )
                    }


                  </Link>

                )

              })
            }


          </nav>



          {/* CTA */}

          <div className="hidden md:block">

            <motion.div
            whileHover={{
              scale:1.05
            }}
            whileTap={{
              scale:.95
            }}
            >

              <Link
              href="/auth/login"
              className="
              rounded-xl
              bg-yellow-400
              px-6 py-3
              font-semibold
              text-black
              hover:bg-yellow-300
              transition
              "
              >

                Login

              </Link>

            </motion.div>

          </div>



          {/* Mobile Button */}

          <button
          onClick={()=>setOpen(!open)}
          className="
          md:hidden
          text-white
          "
          >

            <Menu size={30}/>

          </button>


        </div>


      </Container>


      {
        open &&
        <MobileMenu close={()=>setOpen(false)}/>
      }


    </header>

  )

}