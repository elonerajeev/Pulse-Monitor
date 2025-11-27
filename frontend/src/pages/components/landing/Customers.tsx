const Customers = () => {
    const customerLogos = [
        { src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", alt: "Google" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Meta-Logo.svg", alt: "Meta" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", alt: "Microsoft" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon" },
        { src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", alt: "Netflix" },
      ];
      return (
<section className="py-16">
<div className="container mx-auto px-4">
  <h3 className="text-center text-lg text-muted-foreground mb-8">
    Trusted by developers at leading companies
  </h3>
  <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
    {customerLogos.map((logo) => (
      <img
        key={logo.alt}
        src={logo.src}
        alt={logo.alt}
        className="h-10 object-contain"
      />
    ))}
  </div>
</div>
</section>
      )
}
export default Customers