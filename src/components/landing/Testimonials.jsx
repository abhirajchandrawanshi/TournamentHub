import TestimonialCard from "./TestimonialCard";

const reviews = [

{
initials:"RK",
name:"Rohan Kapoor",
role:"FIDE 2210",
quote:"The matchmaking is spot on and payouts hit my wallet within minutes."
},

{
initials:"SP",
name:"Sara Peterson",
role:"Tournament Organizer",
quote:"Cleanest bracket view I've ever used."
},

{
initials:"AV",
name:"Arjun Verma",
role:"National Candidate Master",
quote:"Feels smoother than Lichess broadcasts."
}

];

export default function Testimonials(){

return(

<section
style={{
background:"var(--bg-1)"
}}
>

<div className="wrap">

<div className="section-title">

<div className="eyebrow">
Community
</div>

<h2>
Trusted by competitive players
</h2>
<p>
  Join thousands of players and organizers using Checkmate League
  for fair matchmaking, fast payouts, and professional tournaments.
</p>
</div>

<div className="testi-grid">

{
reviews.map((review,index)=>(
<TestimonialCard
key={index}
{...review}
/>
))
}

</div>

</div>

</section>

)

}