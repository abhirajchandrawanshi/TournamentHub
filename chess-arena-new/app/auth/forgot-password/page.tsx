import ForgotPasswordForm from "@/modules/auth/ForgotPasswordForm";


export default function ForgotPasswordPage() {

    return (

        <div className="
min-h-screen
flex
items-center
justify-center
bg-[#050816]
">


            <div className="
max-w-md
w-full
bg-white/5
p-8
rounded-2xl
">


                <h1 className="text-3xl font-bold mb-6">

                    Reset Password

                </h1>


                <ForgotPasswordForm />


            </div>


        </div>

    )

}