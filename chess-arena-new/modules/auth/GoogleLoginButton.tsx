"use client";

import {authService}
from "@/services/auth.service";


export default function GoogleLoginButton(){


const login=async()=>{


const googleToken="GOOGLE_TOKEN";


await authService.googleLogin(
googleToken
);


}



return (

<button

onClick={login}

className="
w-full
border
border-white/20
rounded-xl
py-3
hover:bg-white/10
"

>

Continue with Google

</button>

)

}