import { Trophy, Wallet, ShieldCheck } from "lucide-react";

export default function Feature() {
  const features = [
    {
      icon: Trophy,
      title: "Professional Tournaments",
      desc: "Create and join competitive tournaments."
    },
    {
      icon: Wallet,
      title: "Wallet System",
      desc: "Deposit, Withdraw and Win Cash."
    },
    {
      icon: ShieldCheck,
      title: "Secure Platform",
      desc: "JWT Authentication & Fair Play."
    }
  ];

  return (
    <section className="container py-24">

      <h2 className="text-5xl font-bold text-center mb-16">
        Platform Features
      </h2>

      <div className="grid md:grid-cols-3 gap-8">

        {features.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="bg-[#141922] rounded-2xl p-10 border border-gray-800 hover:border-green-500 transition"
            >

              <Icon className="text-green-400 w-12 h-12"/>

              <h3 className="text-2xl font-bold mt-6">
                {item.title}
              </h3>

              <p className="text-gray-400 mt-4">
                {item.desc}
              </p>

            </div>

          )

        })}

      </div>

    </section>
  );
}